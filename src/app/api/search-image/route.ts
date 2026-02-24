
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { query } = await req.json();

        if (!query) {
            return new Response(JSON.stringify({ error: "No query provided" }), { status: 400 });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-image",
            generationConfig: {
                responseModalities: ["IMAGE", "TEXT"],
            } as any,
        });

        const result = await model.generateContent(
            `Generate a realistic, appetizing food photo of: ${query}. The image should look like professional food photography with good lighting and plating.`
        );

        const parts = result.response.candidates?.[0]?.content?.parts || [];

        for (const part of parts) {
            if ((part as any).inlineData) {
                const { data, mimeType } = (part as any).inlineData;
                const dataUrl = `data:${mimeType};base64,${data}`;
                return new Response(JSON.stringify({ imageUrl: dataUrl }));
            }
        }

        return new Response(JSON.stringify({ error: "No image generated" }), { status: 500 });

    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error("Image generation error:", errMsg);
        return new Response(JSON.stringify({ error: `Image generation failed: ${errMsg}` }), { status: 500 });
    }
}
