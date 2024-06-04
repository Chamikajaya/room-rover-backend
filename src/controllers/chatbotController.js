"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = void 0;
const openai_1 = __importStar(require("../utils/openai"));
const pinecone_1 = require("../utils/pinecone");
const client_1 = require("@prisma/client");
const ai_1 = require("ai"); // ! GOT DEPRECATED WARNING
const prisma = new client_1.PrismaClient();
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Route hit --> POST /api/v1/chat");
    try {
        // extract the messages from the request body
        const messages = req.body.messages;
        const truncatedMessages = messages.slice(-8); // get the last 8 messages
        // iterate the messages array and get a final big string of text to be sent to generate embeddings  ==>
        const stringOfTextFromConversation = truncatedMessages.map((message) => message.content).join("\n");
        // get the embeddings for the messages truncated ->
        const embeddings = yield (0, openai_1.getEmbedding)(stringOfTextFromConversation);
        // get embeddings from Pinecone, which are similar to the embeddings corresponding to the conversation we had, in fact this will return an obj similar to the following , refer ==> https://docs.pinecone.io/reference/api/data-plane/query
        const similarEmbeddingsFromPineconeDb = yield pinecone_1.hotelIndex.query({
            vector: embeddings, // pass the embeddings we got from the conversation
            topK: 10, // how many similar results to send, higher the better, however since we will be sending more data to LLM model, hence cost is also high
        });
        // now get the corresponding notes for those embeddings returned by Pinecone
        const relatedHotels = yield prisma.hotel.findMany({
            where: {
                id: { in: similarEmbeddingsFromPineconeDb.matches.map((match) => match.id) } // coz hotels in Mongodb and embeddings in Pinecone has the same id 😊
            }
        });
        console.log("The related notes to the ongoing chat are as follows .. \n " + relatedHotels);
        const systemMessage = {
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
        const llmResponse = yield openai_1.default.chat.completions.create({
            model: "gpt-3.5-turbo",
            stream: true,
            messages: [systemMessage, ...truncatedMessages]
        });
        // return the response -> https://sdk.vercel.ai/docs/api-reference/providers/openai-stream
        const stream = (0, ai_1.OpenAIStream)(llmResponse);
        return new ai_1.StreamingTextResponse(stream);
    }
    catch (e) {
        console.log("ERROR - SEND MESSAGE @POST --> " + e);
        res.status(500).json({ errorMessage: "Internal Server Error" });
    }
});
exports.sendMessage = sendMessage;
