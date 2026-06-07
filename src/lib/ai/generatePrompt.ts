import { Product, Cluster, APIKeys } from '../../types';
import { callGeminiTextWithFallback } from './geminiHelper';

export async function generatePrompt(product: Product, cluster: Cluster, keys: APIKeys | null): Promise<string> {
  const isDemo = !keys || !keys.textKey || !keys.textProvider;

  if (isDemo) {
    // Return high-quality pre-baked briefs based on example product and matched cluster
    const name = product.name.toLowerCase();
    const clusterLabel = cluster.label.toLowerCase();

    if (name.includes('nike')) {
      if (clusterLabel.includes('outdoor') || clusterLabel.includes('running') || clusterLabel.includes('fitness') || clusterLabel.includes('trail')) {
        return `Scene: A lone runner scaling a muddy, root-strewn forest path at sunrise. Fog hangs low in the trees, and the runner's feet kick up wet dirt and water droplets as they stride forward.
Subject: The Nike Pegasus Trail 5 shoe, highlighted in a close-up action shot showing the aggressive tread gripping the slippery, wet trail.
Segment: High-endurance trail runners, ultramarathoners, and outdoor enthusiasts who thrive on physical challenges.
Tone: Intense, raw, gritty, and deeply motivational.
Colors: Obsidian black, summit white, with high-visibility Volt Green accents on the shoe and mud splatters.
Avoid: Clean environments, sterile studio lighting, relaxed poses, and plain white backdrops.
Brand constraints: Highlight the ReactX foam comfort and the All Terrain Compound rubber grip. Emphasize raw athletic achievement.`;
      } else {
        return `Scene: An active runner pausing at the peak of a foggy mountain trail, looking out over the wilderness. The lighting is dramatic and overcast, capturing a sense of solo adventure.
Subject: An athlete wearing the Nike Pegasus Trail 5, showing the shoe covered in light dust, standing on rugged rock.
Segment: Outdoor adventurers, hikers, and fitness enthusiasts who value exploration and high-performance gear.
Tone: Aspirational, adventurous, and authentic.
Colors: Natural forest greens, deep blacks, and University Red highlights on the shoe details.
Avoid: Posed catalog shots, city pavements, and pristine gear.
Brand constraints: Show real athletes in natural environments. Emphasize waterproof protection and durability.`;
      }
    } else if (name.includes('muji')) {
      if (clusterLabel.includes('stationery') || clusterLabel.includes('notebook') || clusterLabel.includes('journal') || clusterLabel.includes('study') || clusterLabel.includes('productivity')) {
        return `Scene: A tidy, minimalist wooden desk next to a window with soft morning light filtering through. A steaming mug sits nearby, and a hand is seen holding a simple black gel pen, writing in an open notebook.
Subject: The Muji Recycled Paper Notebook A5, lying flat on the table, showing the clean, unruled off-white pages and thread binding.
Segment: Students, designers, journalers, and bullet journal enthusiasts who value focused, distraction-free workspaces.
Tone: Calm, quiet, intentional, and peaceful.
Colors: Off-white, natural kraft tan, warm greys, and soft wood tones.
Avoid: High-tech devices, glowing screens, messy wire clutter, neon lighting, and corporate buzzwords.
Brand constraints: Celebrate the tactile feel of recycled paper. Emphasize simplicity, flat-lay binding, and sustainability.`;
      } else {
        return `Scene: A flat lay composition on a textured linen surface under diffuse natural side-light. A closed notebook lies next to a single pencil and a small green succulent plant.
Subject: The closed Muji A5 Notebook, showcasing its unbleached kraft paper cover and clean, simple aesthetic.
Segment: Minimalists, creative professionals, and intentional living enthusiasts who practice daily mindfulness.
Tone: Understated, reflective, and serene.
Colors: Warm charcoal grey, soft beige, and natural kraft tones.
Avoid: Flashy logos, bright primary colors, cluttered desks, and aggressive marketing slogans.
Brand constraints: Reflect Muji's 'no-brand quality goods' philosophy. Focus on negative space and clean organization.`;
      }
    }

    // Generic fallback for custom products in demo mode (though custom shouldn't be allowed without keys, just in case)
    return `Scene: A clean presentation of the product in a lifestyle environment that highlights its utility.
Subject: The ${product.name} shown clearly, focusing on its unique features.
Segment: General consumers interested in the product category who value quality and functionality.
Tone: Clear, informative, and engaging.
Colors: Balanced lighting with brand-relevant colors.
Avoid: Distracting backgrounds, cluttered layouts, and unrelated details.
Brand constraints: Align with the core message: "${product.tagline}".`;
  }

  // Live Mode API Call
  const subNames = cluster.subreddits.map(s => s.name).join(', ');
  const promptText = `Write a structured advertising brief for the following product:
Product Name: ${product.name}
Tagline: ${product.tagline}
Product Info: ${product.productInfo}
Brand Style: ${product.brandStyle}

Target Audience Cluster: ${cluster.label} (comprising subreddits like: ${subNames})

The ad brief must be returned as a formatted string with exactly these sections (on separate lines, start with the section label followed by a colon):
Scene: [Describe the visual scene in detail]
Subject: [Describe the primary subject of the ad, like the product or athlete]
Segment: [Describe the target audience segment and their mindset]
Tone: [Describe the emotional tone and voice]
Colors: [Describe the color palette and lighting]
Avoid: [Describe visual elements or themes to strictly avoid based on the brand style]
Brand constraints: [Describe any product-specific claims or branding guidelines to follow]`;

  if (keys.textProvider === 'gemini') {
    const text = await callGeminiTextWithFallback(promptText, keys.textKey);
    return text;
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
      throw new Error(`OpenAI Prompt Generation error: ${res.status} ${errText}`);
    }
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error(`OpenAI Prompt Gen returned invalid response: ${JSON.stringify(data)}`);
    return text;
  }
}
