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
        return `Scene: The visual scene should immerse viewers in the raw, dynamic world of trail running. Feature athletes in intense motion, scrambling up steep, muddy inclines, bounding down technical descents, and navigating rocky paths through dense forests or rugged mountain landscapes. Include natural elements like rain, mud splashing, dirt, and dust. Lighting should be natural—dawn breaking through mist, the harsh sun on a mountain ridge, or an overcast, gritty sky. Shadows and highlights should feel unedited and real. Capture moments of exertion, with visible sweat, mud-splattered legs, and dirt on the shoes, emphasizing the physical struggle and conquest of challenging terrain. The environment itself—dense woods, exposed roots, wet rock faces, and vast trails—should be a prominent character, reflecting the shoe's versatility across varied terrains from paved roads to rugged trails.
Subject: The primary subject is the Nike Pegasus Trail 5 shoe, showcased in action on the feet of a dedicated outdoor athlete. The focus should be on how the shoe performs under duress: its exceptional grip on wet, technical surfaces, the cushioning absorbing impact on descents, and its overall durability and protection against trail debris. The athlete should embody grit, determination, and the deep satisfaction of pushing physical limits and conquering the outdoors. The shoe should appear well-used and integrated with the challenging environment, not pristine.
Segment: The target audience segment consists of dedicated outdoor athletes and trail runners who are driven by adventure, endurance, and physical achievement. They refuse to let challenging terrain or changing weather limit their training, seeing obstacles as opportunities. Their mindset is one of resilience, a hunger for exploration, and a profound appreciation for high-performance gear that can transition seamlessly between diverse environments, from a daily forest run to a grueling ultramarathon. They value authentic experiences, physical exertion, and the satisfaction of mastering difficult paths.
Tone: The emotional tone is bold, raw, grit-filled, and deeply aspirational. The voice is authentic, intense, and grounded in the reality of physical struggle. It speaks directly to the inner drive of the athlete, celebrating the process of training, embracing the dirt, the rain, and the sheer endurance required to conquer the outdoors. It is motivational, urgent, and never overly polished or corporate, reflecting a true understanding of the trail running experience.
Colors: The color palette should be strong and energetic, reflecting both natural elements and athletic intensity. Primary colors are Deep Obsidian Black and Summit White. Accents include Volt Green, symbolizing energy, speed, and visibility, and University Red, representing passion, the athlete's heartbeat, and sheer grit. Lighting should always be natural—dawn, dusk, overcast skies, or harsh midday sun—to create natural shadows and highlights that enhance the raw, unedited feel of the outdoors and the athlete's exertion.
Avoid: Strictly avoid posed studio photography, clean or static poses in front of seamless backdrops, and plain white backgrounds. Do not showcase the shoe in isolated, sanitized environments. The aesthetic must not be overly clean; avoid pristine gear, perfectly clean shoes, or models who do not look like they are actively engaged in strenuous training. Absolutely no soft, cozy, or passive visuals; the tone must be intense, active, and focused on performance and struggle.
Brand constraints: The ad must prominently feature the Nike Pegasus Trail 5 and utilize the tagline: "Built for the trails. Made for the distance." Key product features to highlight are the redesigned engineered mesh upper for breathability and debris protection, the reinforced toe cap for durability, and the full-length ReactX foam midsole delivering 13% more energy return while reducing carbon footprint by at least 43%. Emphasize the high-abrasion ATC rubber outsole with generative traction for exceptional grip and stability. The communication must underscore the shoe's balance of road-smooth comfort and trail-ready durability, positioning it as the ultimate hybrid companion for runners tackling varied terrains and conditions. The messaging should align with the brand's celebration of physical struggle, endurance, and the conquest of challenging environments.`;
      } else {
        return `Scene: A dedicated trail runner, mid-stride, battling challenging and varied terrain. The scene captures the essence of a raw, untamed outdoor environment – transitioning from a muddy, root-strewn forest path to a rocky, steep mountain incline or a slick, wet descent. Natural, dramatic lighting (dawn, dusk, or overcast skies) creates deep shadows and stark highlights, emphasizing the physical exertion and the rugged beauty of the landscape. Rain, mist, or the residue of a recent downpour (puddles, wet surfaces) could be present, showcasing the shoe's performance in adverse conditions. The environment itself feels like an active character, challenging the runner.
Subject: A male or female trail runner, visibly exerting themselves, pushing through challenging elements. The runner's expression should convey intense determination, grit, and focus; sweat on the brow, mud on the legs are encouraged. The Nike Pegasus Trail 5 is prominently featured on their feet, covered in dirt, mud, or water, demonstrating its real-world use and ruggedness. Specific visual cues like the aggressive generative traction pattern on the ATC outsole, the protective reinforced toe cap, and the flexible yet durable engineered mesh upper are subtly highlighted through the action.
Segment: Dedicated outdoor athletes and active individuals who belong to the "Fashion & Lifestyle" cluster. This segment is driven by a strong desire for personal achievement, physical challenge, and authentic, intense experiences. They value high-performance gear that can endure rigorous demands and align with their adventurous, resilient lifestyle. They appreciate the narrative of conquering the outdoors, see running as a form of self-expression and mastery, and are not deterred by harsh conditions, viewing them as an integral part of their journey. They are interested in productivity, self-improvement, and gear that supports their ambitious goals.
Tone: Bold, raw, and grit-filled. The tone is deeply aspirational, speaking directly to the inner drive and unwavering spirit of the athlete. It must feel authentic, intense, and grounded in the reality of physical struggle and endurance required to conquer challenging trails. The message is highly motivational and urgent, celebrating the effort, the dirt, the rain, and the unwavering commitment. It's about pushing boundaries, embracing discomfort, and finding adventure in every stride, never feeling polished or corporate.
Colors: The primary color palette will feature Deep Obsidian Black and Summit White, reflecting strength and elemental purity. Accent colors, Volt Green and University Red, will be strategically incorporated to convey energy, visibility, passion, and raw grit. Lighting will be natural and dramatic—utilizing dawn, dusk, overcast skies, or harsh midday sun—to create strong contrasts, deep shadows, and natural highlights that enhance the raw, unedited, and intense feel of the outdoor environment.
Avoid: Posed studio photography, plain white or sanitized backgrounds, and any pristine or overly clean aesthetic. Do not showcase models with perfectly clean gear, immaculate shoes, or those who do not appear to be actively engaged in rigorous training. The visual tone must strictly avoid anything soft, cozy, relaxing, or passive; instead, it must consistently convey intense action, struggle, and active engagement.
Brand constraints: The creative must clearly convey the Nike Pegasus Trail 5's unique hybrid capability, offering both road-smooth comfort and trail-ready durability for seamless transitions between diverse terrains. Emphasize the key product technologies: the full-length ReactX foam midsole delivering 13% more energy return (compared to previous React) and a 43% reduced carbon footprint, the high-abrasion ATC (All Terrain Compound) rubber outsole with its generative traction pattern for exceptional grip, the breathable yet protective engineered mesh upper, and the reinforced toe cap for enhanced durability. The tagline "Built for the trails. Made for the distance." should be implicitly or explicitly integrated into the campaign's message.`;
      }
    } else if (name.includes('muji')) {
      if (clusterLabel.includes('stationery') || clusterLabel.includes('notebook') || clusterLabel.includes('journal') || clusterLabel.includes('study') || clusterLabel.includes('productivity')) {
        return `Scene: A minimalist, serene workspace bathed in soft, diffuse natural daylight. The Muji Recycled Paper Notebook A5 is centrally placed on a clean surface, such as a light-colored wooden desk, a smooth concrete slab, or a natural linen fabric. Gentle, long shadows are cast by the product and any accompanying simple, non-distracting elements like a single, elegant pen. Generous negative space surrounds the notebook, allowing it to breathe within the calm composition. A subtle human presence, such as a hand gently resting on the open notebook or in the process of writing, reinforces the quiet, tactile experience. The overall impression is one of stillness and focused concentration.
Subject: The Muji Recycled Paper Notebook A5 itself, presented as an understated tool for clear thought and creativity. The ad should highlight its tangible features: the natural kraft paper cover, the smooth, recycled paper that resists ink feathering and show-through, and the thread-stitched binding allowing it to lie perfectly flat. The subject is the notebook in its intended use – facilitating an organic, distraction-free writing experience.
Segment: Individuals who prioritize simplicity, utility, and environmental mindfulness in their daily lives. This cluster includes students, creative professionals, and proponents of minimalist bullet journaling who seek high-quality, functional tools. They appreciate products that support focused work, intentional living, and a "less is more" philosophy, whether they are found in subcultures valuing craft (mechanicalkeyboards, cooking, photography, art), productivity (journaling, stationery), or a connection to nature and self-sufficiency (camping, outdoors, minimalism).
Tone: Calm, quiet, intentional, and understated. The messaging will be simple, honest, and reflective, focusing on the product's inherent utility, quality, and natural origin. The voice is concise and clear, speaking softly to convey mindful practicality rather than aggressively selling, embodying the brand's appreciation for silence and breathing room.
Colors: A muted and harmonious color scheme. Primary colors are Warm Grey, Off-White, and Natural Kraft Tan, complemented by secondary accents of Charcoal, Soft Beige, and Muted Sage Green. All visuals will be illuminated by soft, diffuse natural daylight, creating gentle, long shadows and avoiding any harsh or artificial lighting.
Avoid: Busy or cluttered backgrounds, bright or neon colors, high-saturation hues, flashing lights, or digital aesthetics. Do not place the notebook next to glowing screens, excessive cables, or modern gaming setups. The advertisement must strictly avoid hype-driven language, bold exclamation points, neon typography, or sensational marketing slogans. There should be no messy desks, busy patterns, or colorful backdrops.
Brand constraints: The ad must prominently feature the product name "Muji Recycled Paper Notebook A5" and reinforce the tagline "Less is more. Think clearly." Messaging must highlight Muji's core principles: simplicity, utility, and environmental mindfulness. Specific product features to convey are the sturdy yet flexible unbleached kraft paper cover, the A5 dimensions providing ample space while remaining portable, the 80 sheets of premium recycled paper designed for smooth writing (minimizing feathering/ghosting), and the durable thread-stitching that ensures it lies completely flat. Emphasize its adaptability for various uses (journaling, sketching, note-taking, professional planning) and the absence of margins or decorative elements to encourage structured, flowing thought and a distraction-free experience.`;
      } else {
        return `Scene: A serene flat lay composition featuring the Muji Recycled Paper Notebook A5 centrally placed on a clean, uncluttered surface such as a light wooden desk, a natural linen fabric, or a smooth concrete texture. Soft, diffuse natural daylight streams from the side, creating gentle, elongated shadows that add depth without harshness. The composition utilizes generous negative space around the notebook to allow it to "breathe." A subtle human presence is depicted, such as a hand gently resting on the open notebook or a hand gracefully writing with a gel or fountain pen, emphasizing a quiet, focused moment of journaling, sketching, or note-taking. Ancillary items might include a simple, unadorned pen and perhaps a small, natural element like a smooth stone or a dried leaf, all contributing to a peaceful, intentional workspace.
Subject: The Muji Recycled Paper Notebook A5. The ad highlights its physical attributes: the sturdy yet flexible unbleached kraft paper cover, the compact A5 dimensions, the 80 sheets of premium, environmentally friendly recycled paper, and its perfectly flat-lying thread-stitched binding. Emphasis should be on the smooth, minimalist pages free of margins or decorative elements, showcasing the remarkable absence of ink feathering or show-through even with various pen types. The product embodies simplicity, utility, and environmental mindfulness.
Segment: Individuals from the Fashion & Lifestyle cluster who value functionality, aesthetic simplicity, and sustainability. This includes students, creative professionals, and proponents of minimalist bullet journaling or productivity methods (e.g., from subreddits like bulletjournal, productivity, techsetups, running, crossfit, fashionadvice). They are mindful consumers seeking organic, distraction-free tools that support their thoughtful daily routines, personal organization, and creative expression without compromising on quality or environmental impact. They appreciate understated elegance and products that enhance clarity of thought.
Tone: Calm, quiet, intentional, and understated. The voice is simple, honest, and reflective, avoiding any form of hyperbole, buzzwords, or aggressive sales tactics. Messaging speaks softly and with clarity, prioritizing the utility, quality, and natural origin of the notebook. It conveys mindfulness and conciseness, valuing the breathing room and quiet introspection the product facilitates. The overarching sentiment is one of serene focus and thoughtful engagement.
Colors: A muted, harmonious color scheme reflecting natural materials and peaceful workspaces. Primary colors: Warm Grey, Off-White, Natural Kraft Tan. Secondary colors: Charcoal, Soft Beige, Muted Sage Green. Lighting will be soft, diffuse natural daylight, creating gentle, long shadows. The overall visual impression should be calm, clean, and organic.
Avoid: Busy or cluttered backgrounds, messy desks, or vibrant, patterned backdrops. Bright or neon colors, high-saturation hues, flashing lights, or digital-heavy aesthetics. High-tech environments such as glowing screens, visible cables, or modern gaming setups. Hype-driven advertising, bold exclamation points, neon typography, sensational marketing slogans, or aggressive sales language.
Brand constraints: The ad must uphold the tagline "Less is more. Think clearly." The messaging must reflect Muji's core principles of simplicity, utility, and environmental mindfulness. It should clearly communicate the notebook's ability to lie completely flat when opened, its premium environmentally friendly recycled paper, and its remarkably smooth texture that minimizes ink feathering and show-through for various pens (including gel and fountain pens). Emphasize the lack of margins or decorative elements to foster structured, unimpeded thought. Focus exclusively on product utility, quality, and natural origin. All messaging must be understated and truthful.`;
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
