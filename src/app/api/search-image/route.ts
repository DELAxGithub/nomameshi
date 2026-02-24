
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { dishes } = await req.json();

        if (!dishes || !Array.isArray(dishes) || dishes.length === 0) {
            return new Response(JSON.stringify({ error: "No dishes provided" }), { status: 400 });
        }

        const dishList = dishes.slice(0, 30).join(", ");

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-image",
            generationConfig: {
                responseModalities: ["IMAGE", "TEXT"],
            } as any,
        });

        const result = await model.generateContent(
            `Generate a realistic overhead photo of a beautifully arranged restaurant table spread featuring these dishes: ${dishList}. Shot from directly above, warm natural lighting, dishes on a rustic wooden table with plates, bowls, and utensils. Professional food photography style, appetizing presentation.`
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
        console.error("Table image generation error:", errMsg);
        return new Response(JSON.stringify({ error: `Image generation failed: ${errMsg}` }), { status: 500 });
    }
}
