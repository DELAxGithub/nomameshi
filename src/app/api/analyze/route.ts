
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function POST(req: Request) {
    console.log("Analyze API Request Received");
    try {
        const body = await req.text();
        console.log("Request body size:", (body.length / 1024 / 1024).toFixed(2), "MB");
        const { image } = JSON.parse(body);

        if (!image) {
            return new Response(JSON.stringify({ error: "No image provided" }), { status: 400 });
        }

        const rawBase64 = image.split(",")[1] || image;
        const base64Data = rawBase64.replace(/\s/g, "");

        const prompt = `
    You are an expert Menu Translator. Analyze the provided menu image.

    1. **Detect sections**: Group dishes by the sections visible on the menu (e.g., "EMBUTIDOS Y QUESOS", "SALAZONES Y CONSERVAS", "LATAS").
    2. **Extract & Translate**: For each dish, extract the original name and translate into natural Japanese.
    3. **Image query**: For each dish, create a concise English search query for generating an appetizing food photo.

    Output JSON only (no markdown code blocks):
    {
      "restaurantName": "String (restaurant name if visible, otherwise null)",
      "restaurantVibe": "String (e.g., Traditional Spanish Taberna)",
      "language": "String (detected menu language)",
      "sections": [
        {
          "originalTitle": "String (section title as written on menu)",
          "translatedTitle": "String (Japanese translation of section title)",
          "dishes": [
            {
              "originalName": "String",
              "translatedName": "String (Japanese)",
              "description": "String (brief Japanese description)",
              "price": "String or null",
              "imageQuery": "String (English, concise food photo query)"
            }
          ]
        }
      ]
    }

    If no clear sections exist, use a single section with originalTitle as the restaurant name or "MENU".
    `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: "image/jpeg",
                },
            },
        ]);

        const responseText = result.response.text();
        const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        const data = JSON.parse(cleanedText);

        return new Response(JSON.stringify(data));

    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error("Gemini API Error:", errMsg);
        return new Response(JSON.stringify({ error: `Failed to process menu: ${errMsg}` }), { status: 500 });
    }
}
