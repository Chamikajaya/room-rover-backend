import {Request, Response} from "express";
import OpenAI from "openai";
import ChatCompletionMessage = OpenAI.ChatCompletionMessage;
import openAI, {getEmbedding} from "../utils/openai";
import {hotelIndex} from "../utils/pinecone";
import {PrismaClient} from "@prisma/client";
import {OpenAIStream, StreamingTextResponse} from "ai";  // ! GOT DEPRECATED WARNING

const prisma = new PrismaClient();


export const sendMessage = async (req: Request, res: Response) => {
    console.log("Route hit --> POST /api/v1/chat")

    try {
        // extract the messages from the request body
        const messages: ChatCompletionMessage[] = req.body.messages;

        const truncatedMessages = messages.slice(-8); // get the last 8 messages

        // iterate the messages array and get a final big string of text to be sent to generate embeddings  ==>
        const stringOfTextFromConversation = truncatedMessages.map((message) => message.content).join("\n")

        // get the embeddings for the messages truncated ->
        const embeddings = await getEmbedding(stringOfTextFromConversation);

        // get embeddings from Pinecone, which are similar to the embeddings corresponding to the conversation we had, in fact this will return an obj similar to the following , refer ==> https://docs.pinecone.io/reference/api/data-plane/query
        const similarEmbeddingsFromPineconeDb = await hotelIndex.query({
            vector: embeddings,  // pass the embeddings we got from the conversation
            topK: 10,  // how many similar results to send, higher the better, however since we will be sending more data to LLM model, hence cost is also high
        })

        // now get the corresponding notes for those embeddings returned by Pinecone
        const relatedHotels = await prisma.hotel.findMany({
            where: {
                id: {in: similarEmbeddingsFromPineconeDb.matches.map((match) => match.id)}  // coz hotels in Mongodb and embeddings in Pinecone has the same id 😊
            }
        })

        console.log("The related notes to the ongoing chat are as follows .. \n " + relatedHotels)

        const systemMessage: ChatCompletionMessage = {
            role: "assistant",
            content: `
You are an advanced AI-powered search assistant bot for a website called ROOM ROVER. Your primary function is to assist users in finding the best hotels from the ROOM ROVER database based on their preferences and requirements. Here are the key points you should follow:

1. **Hotel-Related Inquiries Only**: If a user asks something unrelated to hotel search or planning, politely inform them that you can only assist with hotel-related queries.

2. **Hotel Recommendations**: Based on the user's requirements, provide the best possible 3 hotel recommendations. Include the following details for each hotel:
   - Hotel ID
   - Hotel Name
   - Location (City, Country)
   - Facilities
   - Price per night
   - Description
   - URL (format: http://localhost:3000/hotel-details/{hotelId})

3. **User Engagement**: Be friendly and engaging while ensuring the information is clear and concise. 

Below are the pertinent hotels related to the current query:

${relatedHotels.map(hotel => `
Hotel ID: ${hotel.id}
Hotel Name: ${hotel.name}
Location: ${hotel.city}, ${hotel.country}
Facilities: ${hotel.facilities}
Price per Night: ${hotel.pricePerNight}
Description: ${hotel.description}
URL: http://localhost:3000/hotel-details/${hotel.id}
`).join("\n\n")}
            `.trim()
        };

        // making request to LLM
        const llmResponse = await openAI.chat.completions.create({
            model:"gpt-3.5-turbo",
            stream:true,
            messages:[systemMessage, ...truncatedMessages]
        })

        // return the response -> https://sdk.vercel.ai/docs/api-reference/providers/openai-stream
        const stream = OpenAIStream(llmResponse);
        return new StreamingTextResponse(stream)




    } catch (e) {
        console.log("ERROR - SEND MESSAGE @POST --> " + e);
        res.status(500).json({errorMessage: "Internal Server Error"});
    }

};