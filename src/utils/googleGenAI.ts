// Reference Docs => https://ai.google.dev/gemini-api/docs/get-started/tutorial?lang=node

import {GoogleGenerativeAI} from "@google/generative-ai";

const apiKey = process.env.API_KEY;

if (!apiKey)
    throw new Error("No Google Generative AI API key found in environment variables");


const googleGenAI = new GoogleGenerativeAI(apiKey);

const genAIModel = googleGenAI.getGenerativeModel({model: "gemini-1.5-flash"});

export default genAIModel;