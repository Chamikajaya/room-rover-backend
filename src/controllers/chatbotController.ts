import {Request, Response} from "express";
import OpenAI from "openai";
import ChatCompletionMessage = OpenAI.ChatCompletionMessage;
import openAI, {getEmbedding} from "../utils/botRelatedUtils/openai";
import {hotelIndex} from "../utils/botRelatedUtils/pinecone";
import {PrismaClient} from "@prisma/client";
import {OpenAIStream, StreamingTextResponse} from "ai";

const prisma = new PrismaClient();

export const sendMessage = async (req: Request, res: Response) => {
    console.log("Route hit --> POST /api/v1/chat");

    try {
        // Extract the messages from the request body
        const messages: ChatCompletionMessage[] = req.body.messages;
        console.log("The messages are as follows .. \n " + JSON.stringify(messages));

        const truncatedMessages = messages.slice(-8); // Get the last 8 messages

        // Combine messages into a single string
        const stringOfTextFromConversation = truncatedMessages.map((message) => message.content).join("\n");

        // Get embeddings for the conversation
        const embeddings = await getEmbedding(stringOfTextFromConversation);

        // Query Pinecone for similar embeddings
        const similarEmbeddingsFromPineconeDb = await hotelIndex.query({
            vector: embeddings,
            topK: 10,
        });

        // Fetch related hotels from the database
        const relatedHotels = await prisma.hotel.findMany({
            where: {
                id: {in: similarEmbeddingsFromPineconeDb.matches.map((match) => match.id)}
            }
        });
        console.log("The related hotels are as follows .. \n " + JSON.stringify(relatedHotels));

        // Construct the system message for LLM
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

        // Request LLM response with streaming
        // const llmResponse = await openAI.chat.completions.create({
        //     model: "gpt-3.5-turbo",
        //     stream: true,
        //     messages: [systemMessage, ...truncatedMessages]
        // });

        const llmResponse = await openAI.chat.completions.create({
            model: "gpt-3.5-turbo",
            stream: true,
            messages: [systemMessage, ...truncatedMessages, {role: "user", content: "What are the best hotels in Sri Lanka"}]
        });


        console.log("LLM Response:", llmResponse);

        // Create a readable stream
        const stream = OpenAIStream(llmResponse);

        console.log("Stream:", stream);

        // Return the streaming response
        return new StreamingTextResponse(stream);

    } catch (e) {
        console.log("ERROR - SEND MESSAGE @POST --> " + e);
        res.status(500).json({errorMessage: "Internal Server Error"});
    }
};