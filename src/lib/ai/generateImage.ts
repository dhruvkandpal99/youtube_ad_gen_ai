import { APIKeys } from '../../types';
import { callGeminiImageWithFallback } from './geminiHelper';

async function getBase64FromUrl(url: string): Promise<{ mimeType: string; base64Data: string } | null> {
  if (!url) return null;
  try {
    let dataUrl = url;
    if (!url.startsWith('data:')) {
      const res = await fetch(url);
      const blob = await res.blob();
      dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
    const matches = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (matches) {
      return {
        mimeType: matches[1],
        base64Data: matches[2]
      };
    }
    return null;
  } catch (err) {
    console.error('Failed to convert asset URL to base64', err);
    return null;
  }
}

export async function generateImage(prompt: string, assetUrl: string | undefined, keys: APIKeys | null): Promise<string> {
  const isDemo = !keys || !keys.imageKey || !keys.imageProvider;

  if (isDemo) {
    const p = prompt.toLowerCase();
    
    // Detect Nike product in prompt
    if (p.includes('nike') || p.includes('pegasus') || p.includes('trail') || p.includes('runner')) {
      if (p.includes('immerse') || p.includes('dynamic world') || p.includes('scrambling')) {
        return '/ads/nike/ad_outdoor.jpg';
      }
      return '/ads/nike/ad_endurance.jpg';
    }

    // Detect Muji notebook in prompt
    if (p.includes('muji') || p.includes('notebook') || p.includes('journal') || p.includes('desk') || p.includes('a5')) {
      if (p.includes('stillness') || p.includes('focused concentration') || p.includes('minimalist, serene workspace')) {
        return '/ads/muji/ad_study.jpg';
      }
      return '/ads/muji/ad_minimal.jpg';
    }

    // Default fallbacks
    return '/ads/nike/ad_outdoor.jpg';
  }

  // Live Mode API Call
  if (keys.imageProvider === 'gemini') {
    const refImage = assetUrl ? await getBase64FromUrl(assetUrl) : null;
    const base64 = await callGeminiImageWithFallback(prompt, keys.imageKey, refImage || undefined);
    return `data:image/jpeg;base64,${base64}`;
  } else if (keys.imageProvider === 'openai') {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${keys.imageKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1792x1024',
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI Image Generation error: ${res.status} ${errText}`);
    }
    const data = await res.json();
    const url = data.data?.[0]?.url;
    if (!url) throw new Error(`OpenAI Image Gen returned invalid response: ${JSON.stringify(data)}`);
    return url;
  } else {
    // Stability AI v2beta Stable Image Core
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('aspect_ratio', '16:9');
    formData.append('output_format', 'png');

    const res = await fetch('https://api.stability.ai/v2beta/stable-image/generate/core', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${keys.imageKey}`,
      },
      body: formData,
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Stability AI Image Gen error: ${res.status} ${errText}`);
    }
    const data = await res.json();
    const base64 = data.image;
    if (!base64) throw new Error(`Stability AI returned invalid response: ${JSON.stringify(data)}`);
    return `data:image/png;base64,${base64}`;
  }
}
