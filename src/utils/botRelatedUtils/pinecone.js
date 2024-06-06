"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hotelIndex = void 0;
const pinecone_1 = require("@pinecone-database/pinecone");
const apiKey = process.env.PINECONE_API_KEY;
if (!apiKey)
    throw new Error("No Pinecone API key found in environment variables");
const pinecone = new pinecone_1.Pinecone({ apiKey: apiKey });
exports.hotelIndex = pinecone.index("roomie");
