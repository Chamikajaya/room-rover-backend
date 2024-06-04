import {getEmbedding} from "./openai";

export async function createEmbeddingForHotel(hotelId: string, hotelName: string, description: string) {
    return await getEmbedding(hotelId + "\n\n" + hotelName + "\n\n" + description);
}