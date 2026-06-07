import { Product, APIKeys } from '../../types';
import { callGeminiTextWithFallback } from './geminiHelper';

export async function chat(message: string, product: Product, keys: APIKeys | null): Promise<string> {
  const isDemo = !keys || !keys.textKey || !keys.textProvider;

  if (isDemo) {
    const msg = message.toLowerCase();
    const prodName = product.name.toLowerCase();

    if (prodName.includes('nike')) {
      if (msg.includes('midsole') || msg.includes('foam') || msg.includes('reactx') || msg.includes('cushion')) {
        return "The Nike Pegasus Trail 5 features a full-length ReactX foam midsole, which delivers 13% more energy return compared to older React foam technology while reducing carbon footprint by 43%. It provides a smooth, cushioned transition across any surface.";
      }
      if (msg.includes('grip') || msg.includes('outsole') || msg.includes('traction') || msg.includes('rubber') || msg.includes('slip')) {
        return "The outsole uses Nike's ATC (All Terrain Compound) high-abrasion rubber, combined with a generative traction pattern. This gives the runner excellent grip on wet climbs and stability on technical downhills.";
      }
      if (msg.includes('brand') || msg.includes('tone') || msg.includes('style') || msg.includes('avoid')) {
        return "The brand guidelines specify a bold, raw, and grit-filled tone. We always show real athletes in action with natural lighting. We strictly avoid clean studio setups, white backgrounds, and posed catalog shots.";
      }
      return "The Nike Pegasus Trail 5 is a hybrid trail running shoe that balances road comfort with rugged trail durability. Key selling points include the ReactX foam midsole, waterproof-ready mesh, and ATC rubber outsole.";
    }

    if (prodName.includes('muji')) {
      if (msg.includes('paper') || msg.includes('recycled') || msg.includes('ink') || msg.includes('bleed')) {
        return "The notebook features 80 sheets of premium, environmentally friendly recycled paper. It is carefully engineered to have a smooth texture that resists ink feathering and ghosting, even with fountain pens.";
      }
      if (msg.includes('binding') || msg.includes('flat') || msg.includes('open')) {
        return "It uses a durable thread-stitch binding method. This enables the notebook to lie completely flat when opened, ensuring a comfortable writing experience from edge to edge.";
      }
      if (msg.includes('brand') || msg.includes('tone') || msg.includes('style') || msg.includes('avoid')) {
        return "The Muji style guide emphasizes a calm, quiet, and intentional tone. Visuals should be clean flat lays with natural light and lots of negative space. Avoid high-tech devices, cluttered backgrounds, and neon colors.";
      }
      return "The Muji Recycled Paper Notebook A5 is designed for mindful journaling and clean note-taking. Key features include the unbleached kraft paper cover, premium bleed-resistant recycled paper, and lay-flat stitched binding.";
    }

    return `This is a demo assistant for ${product.name}. We recommend showcasing its core value proposition: "${product.tagline}" and following the brand style guidelines.`;
  }

  // Live Mode API Call
  const promptText = `You are a YouTube advertising assistant answering questions about a product.
Here is the product info:
${product.productInfo}

Here is the brand style guide:
${product.brandStyle}

Please answer the user's question. Be helpful, concise (maximum 3 sentences), and write in the style of the brand.

User Question: ${message}`;

  if (keys.textProvider === 'gemini') {
    const text = await callGeminiTextWithFallback(promptText, keys.textKey);
    return text.trim();
  } else {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${keys.textKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: promptText }],
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI Chat error: ${res.status} ${errText}`);
    }
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error(`OpenAI Chat returned invalid response: ${JSON.stringify(data)}`);
    return text.trim();
  }
}
