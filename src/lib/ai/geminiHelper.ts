export async function callGeminiTextWithFallback(promptText: string, key: string): Promise<string> {
  const models = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
  ];
  let lastError: Error | null = null;
  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
          }),
        }
      );
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini Error (${model}): ${res.status} ${errText}`);
      }
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error(`Gemini returned invalid response for ${model}: ${JSON.stringify(data)}`);
      }
      return text;
    } catch (err) {
      console.warn(`Model ${model} failed, trying next...`, err);
      lastError = err as Error;
      continue;
    }
  }
  throw lastError || new Error('All Gemini text models failed');
}

export async function callGeminiImageWithFallback(promptText: string, key: string): Promise<string> {
  const models = [
    'imagen-3.0-generate-002',
    'gemini-2.0-flash-preview-image-generation',
    'imagen-3.0-generate-001',
  ];
  let lastError: Error | null = null;
  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
          }),
        }
      );
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini Image Error (${model}): ${res.status} ${errText}`);
      }
      const data = await res.json();
      const base64 = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64) {
        throw new Error(`Gemini Image returned invalid response for ${model}: ${JSON.stringify(data)}`);
      }
      return base64;
    } catch (err) {
      console.warn(`Model ${model} failed, trying next...`, err);
      lastError = err as Error;
      continue;
    }
  }
  throw lastError || new Error('All Gemini image models failed');
}

export async function callGeminiEmbedWithFallback(text: string, key: string): Promise<number[]> {
  const models = [
    'gemini-embedding-001',
    'text-embedding-004',
  ];
  let lastError: Error | null = null;
  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: { parts: [{ text }] } }),
        }
      );
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini Embedding Error (${model}): ${res.status} ${errText}`);
      }
      const data = await res.json();
      if (!data.embedding?.values) {
        throw new Error(`Gemini Embedding returned invalid response for ${model}: ${JSON.stringify(data)}`);
      }
      return data.embedding.values;
    } catch (err) {
      console.warn(`Model ${model} failed, trying next...`, err);
      lastError = err as Error;
      continue;
    }
  }
  throw lastError || new Error('All Gemini embedding models failed');
}
