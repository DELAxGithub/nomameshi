
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

        // Extract MIME type from data URL (e.g. "data:image/png;base64,...")
        const mimeMatch = image.match(/^data:(image\/[^;]+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
        const rawBase64 = image.split(",")[1] || image;
        const base64Data = rawBase64.replace(/\s/g, "");

        const prompt = `
    You are an expert Menu Translator. Analyze the provided image.

    IMPORTANT: First, determine if this image is a restaurant/cafe menu. If it is NOT a menu (e.g., a photo of food, a person, an animal, a landscape, a receipt, or any non-menu image), respond with exactly:
    {"error": "NOT_A_MENU"}

    If it IS a menu, proceed:
    1. **Detect sections**: Group dishes by the sections visible on the menu.
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
                    mimeType,
                },
            },
        ]);

        const responseText = result.response.text();
        const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

        let data;
        try {
            data = JSON.parse(cleanedText);
        } catch {
            console.error("JSON parse failed. Raw response:", cleanedText.slice(0, 500));
            return new Response(
                JSON.stringify({ error: "Failed to parse menu data. Please try again with a clearer photo." }),
                { status: 500 }
            );
        }

        if (data.error === "NOT_A_MENU") {
            return new Response(
                JSON.stringify({ error: "This doesn't appear to be a menu. Please upload a photo of a restaurant menu." }),
                { status: 400 }
            );
        }

        return new Response(JSON.stringify(data));

    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error("Gemini API Error:", errMsg);
        return new Response(JSON.stringify({ error: `Failed to process menu: ${errMsg}` }), { status: 500 });
    }
}
