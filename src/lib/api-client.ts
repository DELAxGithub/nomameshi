export async function* analyzeMenuImage(
  image: string,
  targetLang: string,
  selectedRegion: string
): AsyncGenerator<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);

  let response: Response;
  try {
    response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image, targetLang, selectedRegion }),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("TIMEOUT");
    }
    throw new Error("NETWORK_ERROR");
  }

  if (response.status === 429) {
    clearTimeout(timeout);
    throw new Error("RATE_LIMITED");
  }
  if (!response.ok) {
    clearTimeout(timeout);
    throw new Error(`API_ERROR:${response.status}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield decoder.decode(value, { stream: true });
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("TIMEOUT");
    }
    throw new Error("STREAM_INTERRUPTED");
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateTableImage(
  dishes: string[]
): Promise<string | null> {
  const response = await fetch("/api/generate-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dishes }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const { imageUrl } = await response.json();
  return imageUrl;
}
