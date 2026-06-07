export async function callGeminiTextWithFallback(promptText: string, key: string): Promise<string> {
  const models = [
    'gemini-2.5-pro',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
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

export async function callGeminiImageWithFallback(
  promptText: string,
  key: string,
  referenceImage?: { mimeType: string; base64Data: string }
): Promise<string> {
  const models = [
    { name: 'gemini-3.1-flash-image', protocol: 'generateContent' },
    { name: 'gemini-3-pro-image', protocol: 'generateContent' },
    { name: 'gemini-2.5-flash-image', protocol: 'generateContent' },
  ];
  let lastError: Error | null = null;
  for (const model of models) {
    try {
      if (model.protocol === 'generateContent') {
        const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [
          { text: promptText },
        ];
        if (referenceImage) {
          parts.push({
            inlineData: {
              mimeType: referenceImage.mimeType,
              data: referenceImage.base64Data,
            },
          });
        }
        
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model.name}:generateContent?key=${key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts }],
            }),
          }
        );
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Gemini Image Error (${model.name}): ${res.status} ${errText}`);
        }
        const data = await res.json();
        
        const resParts = data.candidates?.[0]?.content?.parts;
        if (!resParts || !Array.isArray(resParts)) {
          throw new Error(`Gemini Image returned invalid response format for ${model.name}`);
        }
        
        let base64: string | undefined;
        for (const part of resParts) {
          if (part.inlineData?.data) {
            base64 = part.inlineData.data;
            break;
          }
        }
        
        if (!base64) {
          throw new Error(`Gemini Image returned no inline image data for ${model.name}`);
        }
        return base64;
      } else {
        // predict protocol for dedicated Imagen models
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model.name}:predict?key=${key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              instances: [{ prompt: promptText }],
              parameters: {
                sampleCount: 1,
                aspectRatio: '16:9',
              },
            }),
          }
        );
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Gemini Imagen Predict Error (${model.name}): ${res.status} ${errText}`);
        }
        const data = await res.json();
        const base64 = data.predictions?.[0]?.bytesBase64Encoded;
        if (!base64) {
          throw new Error(`Gemini Imagen Predict returned no bytesBase64Encoded for ${model.name}: ${JSON.stringify(data)}`);
        }
        return base64;
      }
    } catch (err) {
      console.warn(`Model ${model.name} failed, trying next...`, err);
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
