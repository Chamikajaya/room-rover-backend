import {generateEmbedding} from "./vertex-ai";

export async function generateEmbeddingForHotel(
    name: string,
    pricePerNight: number,
    starRating: number,
    numAdults: number,
    numChildren: number,
    type: string,
    country: string,
    city: string,
    facilities: string[],
    description: string,
) {

    return generateEmbedding(name + "\n\n" + pricePerNight + "\n\n" + starRating + "\n\n" + numAdults + "\n\n" + numChildren + "\n\n" + type + "\n\n" + country + "\n\n" + city + "\n\n" + facilities.join("\n") + "\n\n" + description);
}