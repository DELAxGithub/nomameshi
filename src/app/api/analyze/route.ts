
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "edge";
export const maxDuration = 60;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
    generationConfig: {
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
    },
});

export async function POST(req: Request) {
    console.log("Analyze API Request Received");
    try {
        const body = await req.text();
        console.log("Request body size:", (body.length / 1024 / 1024).toFixed(2), "MB");
        const { image, targetLang = "Japanese", selectedRegion = "auto" } = JSON.parse(body);

        if (!image) {
            return new Response(JSON.stringify({ error: "No image provided" }), { status: 400 });
        }

        // Extract MIME type from data URL (e.g. "data:image/png;base64,...")
        const mimeMatch = image.match(/^data:(image\/[^;]+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
        const rawBase64 = image.split(",")[1] || image;
        const base64Data = rawBase64.replace(/\s/g, "");

        const countryContext = selectedRegion !== "auto"
            ? `USER CONTEXT: The user has indicated this menu is from the country with ISO code "${selectedRegion}". Use this information to immediately determine the local language and culinary context to speed up your analysis.`
            : "";

        const prompt = `
    ${countryContext}
    You are an expert Menu Translator. Analyze the provided image.

    IMPORTANT: First, determine if this image is a restaurant/cafe menu. If it is NOT a menu (e.g., a photo of food, a person, an animal, a landscape, a receipt, or any non-menu image), respond with exactly:
    {"error": "NOT_A_MENU"}

    If it IS a menu, proceed:
    1. **Detect Country**: Detect the country of the menu based on language, currency, vibe, or dish names.
    2. **Detect sections**: Group dishes by the sections visible on the menu.
    3. **Extract & Translate**: For each dish, extract the original name and translate into natural ${targetLang}.
    4. **Image query**: For each dish, create a concise English search query for generating an appetizing food photo.

    Output JSON only (no markdown code blocks):
    {
      "detected_country_code": "String (ISO 3166-1 alpha-2, e.g. ES, IT, JP, US)",
      "restaurantName": "String (restaurant name if visible, otherwise null)",
      "restaurantVibe": "String (e.g., Traditional Spanish Taberna)",
      "language": "String (detected menu language)",
      "sections": [
        {
          "originalTitle": "String (section title as written on menu)",
          "translatedTitle": "String (${targetLang} translation of section title)",
          "dishes": [
            {
              "originalName": "String",
              "translatedName": "String (${targetLang})",
              "description": "String (Provide a helpful ${targetLang} explanation of the dish. Do NOT just repeat the translatedName. If the originalName contains unfamiliar regional cooking styles, unique local ingredients, or proper nouns (e.g. 'Galicia style', 'Guanciale'), briefly explain what they are and how they taste. STRICT RULE: NEVER use definitive statements like 'It contains X' or 'It is Y'. MUST use speculative language like 'It is generally made with', 'It often contains', 'Usually features'. Keep the explanation concise, maximum 1-2 short sentences to fit in a compact UI.)",
              "price": "String or null",
              "imageQuery": "String (English, concise food photo query)"
            }
          ]
        }
      ]
    }

    If no clear sections exist, use a single section with originalTitle as the restaurant name or "MENU".
    `;

        const resultStream = await model.generateContentStream([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType,
                },
            },
        ]);

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of resultStream.stream) {
                        const chunkText = chunk.text();
                        controller.enqueue(new TextEncoder().encode(chunkText));
                    }
                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            }
        });

        return new Response(stream, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });

    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error("Gemini API Error:", errMsg);
        return new Response(JSON.stringify({ error: `Failed to process menu: ${errMsg}` }), { status: 500 });
    }
}
