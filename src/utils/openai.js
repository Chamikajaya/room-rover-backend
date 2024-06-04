"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmbedding = void 0;
const openai_1 = __importDefault(require("openai"));
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey)
    throw new Error("No OpenAI API key found in environment variables");
const openAI = new openai_1.default({ apiKey });
exports.default = openAI; // export the openAI instance to be used in other files
// refer -->  https://platform.openai.com/docs/guides/embeddings/what-are-embeddings?lang=node
// function to get the embeddings of the text
function getEmbedding(text) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield openAI.embeddings.create({
            model: "text-embedding-ada-002",
            input: text,
        });
        if (!response)
            throw new Error("No response from OpenAI API");
        console.log(response.data[0].embedding);
        return response.data[0].embedding; // returns an array of embeddings
    });
}
exports.getEmbedding = getEmbedding;
