import {Request, Response} from 'express';
import {PrismaClient} from '@prisma/client';
import {hotelIndex} from "../utils/pinecone-client";
import {generateEmbedding, myLLM} from "../utils/vertex-ai";
import {Content} from "@google-cloud/vertexai";

const prisma = new PrismaClient();

// * Defines the structure of each message (role: who sent the message, and content: the message content
interface ChatMessage {
    role: string;
    content: string;
}

export const chatbotController = async (req: Request, res: Response) => {
    try {

        // expects an array of messages in the request body, where each message has a role (e.g., user or assistant) and content (the message text).
        const {messages} = req.body as { messages: ChatMessage[] };

        // 1. Prepare the conversation context
        const lastTenMessages = messages.slice(-10);  // Extracts the last 10 messages from the conversation (for context).

        //  Formats these messages into a single string, with each message prefixed by the role (user or assistant) to give the language model context about the conversation.
        const conversationContext = lastTenMessages.map((msg: ChatMessage) => `${msg.role}: ${msg.content}`).join('\n');

        // 2. Generate embedding for the conversation context
        const contextEmbedding = await generateEmbedding(conversationContext);
        // console.log("Context embedding:", contextEmbedding);

        // 3. Query Pinecone for similar hotel embeddings
        const similarEmbeddingsFromPineconeDb = await hotelIndex.query({
            vector: contextEmbedding,
            topK: 5,
        });

        // console.log("Similar embeddings from Pinecone:", similarEmbeddingsFromPineconeDb);

        // 4. Retrieve full hotel information from mongo database - Uses the hotel IDs returned from Pinecone to query the actual hotel data
        const relatedHotels = await prisma.hotel.findMany({
            where: {
                id: {in: similarEmbeddingsFromPineconeDb.matches.map(match => match.id)}
            }
        });

        console.log("Related hotels for the query :", relatedHotels);

        // 5. Prepare system message with related hotel information
        const systemMessage = `
            You are an AI-powered assistant for Room Rover, a hotel booking app. Your name is Roomie. Your tasks include:
            - Providing hotel information strictly from Room Rover's data.
            - If a user asks an irrelevant question, gently steer the conversation back to hotel-related topics.
            - Avoid making up information. Stick to verified data from Room Rover.
            - Include hotel links in your responses for easy access. Format the links as ***[Hotel Name](http://localhost:3000/hotel-details/{hotelId})***.

            Here is the relevant hotel information:

            ${relatedHotels.map(hotel =>
            `**Hotel:** ${hotel.name}\n**Price:** $${hotel.pricePerNight}/night\n**Rating:** ${hotel.starRating} stars\n**Location:** ${hotel.city}, ${hotel.country}\n**Description:** ${hotel.description}\n[View Hotel](http://localhost:3000/hotel-details/${hotel.id})`
        ).join("\n\n")}
        `;

        // 6. Prepare messages for the LLM in the format expected by Vertex AI -> The system message is sent as the initial instruction, followed by the last 10 conversation messages.
        const llmMessages: Content[] = [
            {role: "user", parts: [{text: systemMessage}]},
            ...lastTenMessages.map(msg => ({
                role: msg.role === "assistant" ? "model" : "user",
                parts: [{text: msg.content}]
            }))
        ];

        // *** 7. Set up streaming response -> Server-Sent Events (SSE): The response is set up to stream data back to the client using Server-Sent Events (SSE), which allows the server to push updates to the client continuously.

        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });

        // 8. Start chat and stream response
        const chat = myLLM.startChat({history: llmMessages});

        // Sends the user's latest message to the LLM and begins streaming the response back in chunks.
        const result = await chat.sendMessageStream(lastTenMessages[lastTenMessages.length - 1].content);


        // As the response is streamed from the LLM, it is written to the HTTP response using res.write, allowing the client to receive updates in real-time.
        for await (const item of result.stream) {
            const chunk = item.candidates?.[0]?.content;
            if (chunk) {
                res.write(`data: ${JSON.stringify(chunk)}\n\n`);
            }
        }

        // Once the message stream is complete, the server sends [DONE] to indicate the end of the conversation.
        res.write('data: [DONE]\n\n');
        res.end();

    } catch (error) {
        console.error("Error in chatbotController:", error);
        res.status(500).json({error: "An error occurred while processing your request."});
    }
};