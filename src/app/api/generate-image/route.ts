import { generateTableImage } from "@/lib/gemini-service";

export async function POST(request: Request) {
  const { dishes } = await request.json();
  const imageUrl = await generateTableImage(dishes);
  return Response.json({ imageUrl });
}
