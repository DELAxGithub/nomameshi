import { analyzeMenuImage } from "@/lib/gemini-service";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const { allowed, remaining } = checkRateLimit(request);
  if (!allowed) {
    return new Response("Too many requests. Please wait a moment.", {
      status: 429,
      headers: { "Retry-After": "60", "X-RateLimit-Remaining": "0" },
    });
  }

  const { image, targetLang, selectedRegion } = await request.json();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of analyzeMenuImage(image, targetLang, selectedRegion)) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Analysis failed";
        controller.enqueue(encoder.encode(JSON.stringify({ error: message })));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
