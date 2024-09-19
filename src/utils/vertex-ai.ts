import {PredictionServiceClient, protos} from '@google-cloud/aiplatform';
import {VertexAI} from "@google-cloud/vertexai";

const vertexAI = new VertexAI({project: process.env.GOOGLE_CLOUD_PROJECT, location: process.env.GOOGLE_CLOUD_LOCATION});

export const myLLM = vertexAI.getGenerativeModel({
    model: "gemini-1.5-pro"
})

// Function to generate embeddings
export const generateEmbedding = async (text: string): Promise<number[]> => {
    try {
        const project = process.env.GOOGLE_CLOUD_PROJECT;
        const model = 'text-embedding-004';
        const task = "QUESTION_ANSWERING";
        const dimensionality = 0;
        const apiEndpoint = 'us-central1-aiplatform.googleapis.com';
        const location = 'us-central1';
        const endpoint = `projects/${project}/locations/${location}/publishers/google/models/${model}`;

        const clientOptions = {apiEndpoint: apiEndpoint};
        const client = new PredictionServiceClient(clientOptions);

        const instances: protos.google.protobuf.IValue[] = text.split(";").map(sentence => ({
            structValue: {
                fields: {
                    content: {stringValue: sentence},
                    task_type: {stringValue: task}
                }
            }
        }));

        const parameters: protos.google.protobuf.IValue = {
            structValue: {
                fields: dimensionality > 0 ? {outputDimensionality: {numberValue: dimensionality}} : {}
            }
        };

        const [response] = await client.predict({
            endpoint,
            instances,
            parameters,
        });

        const embeddings: number[][] = response.predictions?.map((p) => {
            const embeddingsProto = p?.structValue?.fields?.embeddings;
            const valuesProto = embeddingsProto?.structValue?.fields?.values;

            // Safely handle potential null or undefined values
            const values = valuesProto?.listValue?.values?.map((v) => v.numberValue).filter((v): v is number => v !== undefined && v !== null);

            // Ensure only valid numbers are returned
            return values || [];
        }) || [];

        console.log(embeddings[0])

        return embeddings[0];
    } catch (error) {
        console.error("Error generating embeddings:", error);
        throw new Error("Failed to generate embeddings");
    }
};
