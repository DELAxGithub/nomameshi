export async function* analyzeMenuImage(
  image: string,
  targetLang: string,
  selectedRegion: string
): AsyncGenerator<string> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image, targetLang, selectedRegion }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield decoder.decode(value, { stream: true });
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
