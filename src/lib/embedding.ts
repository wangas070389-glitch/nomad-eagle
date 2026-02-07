import { OpenAI } from "openai"

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "mock-key"
})

export async function generateEmbedding(text: string): Promise<number[]> {
    if (!process.env.OPENAI_API_KEY) {
        console.warn("No OPENAI_API_KEY found, returning specific mock embedding for testing.")
        // Return a zero-vector or random vector of correct dimension (1536 for text-embedding-3-small)
        return new Array(1536).fill(0).map(() => Math.random() * 0.01)
    }

    try {
        const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: text.replace(/\n/g, " "),
        })

        return response.data[0].embedding
    } catch (e) {
        console.error("Error generating embedding:", e)
        throw new Error("Failed to generate embedding")
    }
}
