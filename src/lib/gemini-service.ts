import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(API_KEY);

const analyzeModel = genAI.getGenerativeModel({
  model: "gemini-3.1-flash-lite",
  generationConfig: {
    maxOutputTokens: 16384,
    responseMimeType: "application/json",
  },
});

export async function* analyzeMenuImage(
  image: string,
  targetLang: string = "Japanese",
  selectedRegion: string = "auto"
): AsyncGenerator<string> {
  const mimeMatch = image.match(/^data:(image\/[^;]+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
  const rawBase64 = image.split(",")[1] || image;
  const base64Data = rawBase64.replace(/\s/g, "");

  const countryContext =
    selectedRegion !== "auto"
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
    3. **Extract & Translate**: For EVERY SINGLE dish on the menu, extract the original name and translate into natural ${targetLang}. CRITICAL: Do NOT skip or omit any dishes. Include ALL items visible on the menu, even if there are many. Completeness is more important than speed.
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

  const resultStream = await analyzeModel.generateContentStream([
    prompt,
    {
      inlineData: {
        data: base64Data,
        mimeType,
      },
    },
  ]);

  for await (const chunk of resultStream.stream) {
    yield chunk.text();
  }
}

export async function generateTableImage(
  dishes: string[]
): Promise<string | null> {
  const dishList = dishes.slice(0, 30).join(", ");

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-image",
    generationConfig: {
      responseModalities: ["IMAGE", "TEXT"],
    } as any,
  });

  const result = await model.generateContent(
    `Generate a realistic 9:16 vertical smartphone-ratio photo of a restaurant table spread featuring these dishes: ${dishList}. Shot from directly above, cinematic dark lighting with ample dark negative space. Dishes should be arranged vertically on a dark rustic wooden or slate table. Professional food photography style, appetizing presentation but with a dark, sophisticated, moody backdrop that allows bright text to be easily readable over the image.`
  );

  const parts = result.response.candidates?.[0]?.content?.parts || [];

  for (const part of parts) {
    if ((part as any).inlineData) {
      const { data, mimeType } = (part as any).inlineData;
      return `data:${mimeType};base64,${data}`;
    }
  }

  return null;
}
