import { generateTableImage } from "@/lib/gemini-service";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const { allowed } = checkRateLimit(request);
  if (!allowed) {
    return Response.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  const { dishes } = await request.json();
  const imageUrl = await generateTableImage(dishes);
  return Response.json({ imageUrl });
}
