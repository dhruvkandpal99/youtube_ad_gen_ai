import { APIKeys } from '../../types';
import { callGeminiEmbedWithFallback } from './geminiHelper';

export async function embedText(text: string, keys: APIKeys | null): Promise<number[]> {
  if (!keys || !keys.textKey || !keys.textProvider) {
    // Generate a deterministic 8-dimensional vector based on the string hash
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const vector: number[] = [];
    for (let i = 0; i < 8; i++) {
      const val = Math.sin(hash + i) * 10000;
      vector.push(val - Math.floor(val));
    }
    const mag = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    return vector.map(v => v / (mag || 1));
  }

  if (keys.textProvider === 'gemini') {
    return await callGeminiEmbedWithFallback(text, keys.textKey);
  } else {
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${keys.textKey}`,
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-3-small',
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI Embedding error: ${res.status} ${errText}`);
    }
    const data = await res.json();
    if (!data.data?.[0]?.embedding) {
      throw new Error(`OpenAI Embedding returned invalid response: ${JSON.stringify(data)}`);
    }
    return data.data[0].embedding;
  }
}
