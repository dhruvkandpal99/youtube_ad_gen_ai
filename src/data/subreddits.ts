import { Subreddit } from '../types';

export const subreddits: Subreddit[] = [
  // Outdoor/fitness (8)
  {
    name: 'ultrarunning',
    description: 'A community dedicated to long-distance running beyond the standard 26.2-mile marathon. Discussions cover training schedules, high-endurance gear, nutrition plans, race reports for 50k, 100k, and 100-mile trails, and physical and mental grit.'
  },
  {
    name: 'running',
    description: 'A welcoming space for runners of all levels to share training routines, footwear recommendations, and personal milestones. It focuses on cardiovascular fitness, track workouts, marathon preparation, and everyday healthy lifestyle choices.'
  },
  {
    name: 'hiking',
    description: 'A forum for hiking enthusiasts to share trail reports, route maps, outdoor safety guidelines, and backpacking experiences. Conversations emphasize exploring nature, scenic mountain vistas, wilderness preparation, and physical exploration.'
  },
  {
    name: 'trailrunning',
    description: 'A community focused on running on off-road paths, rugged mountain trails, and natural terrain. Members discuss specialized high-grip footwear, hydration vests, navigating elevation change, weather conditions, and outdoor endurance.'
  },
  {
    name: 'camping',
    description: 'A place for camping enthusiasts to share pictures of campsites, outdoor cooking recipes, tent setups, and sleeping bag reviews. Conversations focus on disconnecting from technology, survival skills, and wilderness living.'
  },
  {
    name: 'crossfit',
    description: 'A community dedicated to CrossFit workouts, Olympic weightlifting, gymnastics, and high-intensity interval training (HIIT). Members share daily workouts, nutrition tips, athletic footwear reviews, and physical strength achievements.'
  },
  {
    name: 'cycling',
    description: 'A forum for cyclists of all disciplines, including road cycling, mountain biking, and urban commuting. Conversations center on bicycle maintenance, safety lights, cycling apparel, group rides, and endurance training.'
  },
  {
    name: 'outdoors',
    description: 'A general community celebrating outdoor activities, wildlife photography, nature conservation, and adventure travel. Discussions promote physical recreation, environmental appreciation, and exploring national parks.'
  },

  // Stationery/study (7)
  {
    name: 'notebooks',
    description: 'A community celebrating notebooks, paper quality, binding styles, and journaling tools. Discussions focus on recycled paper textures, ink feathering resistance, cover materials, pocket notebooks, and the tactile writing experience.'
  },
  {
    name: 'bulletjournal',
    description: 'A hub for the Bullet Journal organization method, focusing on hand-drawn planners, habit trackers, and weekly spreads. Members share layout inspiration, clean stationery, calligraphy, and mindful daily reflection habits.'
  },
  {
    name: 'productivity',
    description: 'A forum dedicated to sharing tips, tools, and methodologies for improving focus, organization, and daily efficiency. Discussions center on time management, anti-procrastination strategies, goal setting, and intentional habits.'
  },
  {
    name: 'college',
    description: 'A space for college students to discuss academic preparation, study strategies, note-taking methods, and campus life. Discussions cover study gear, textbook reviews, exam preparation, and organizational skills.'
  },
  {
    name: 'minimalism',
    description: 'A community focused on living with less, simplifying physical belongings, and intentional living. Members share decluttering tips, simple aesthetic workspaces, minimalist product designs, and quiet, distraction-free lifestyles.'
  },
  {
    name: 'journaling',
    description: 'A reflective community for writing thoughts, emotional logging, creative prompts, and preserving daily memories. Conversations emphasize the mental health benefits of writing, pen preferences, and choosing high-quality paper.'
  },
  {
    name: 'stationery',
    description: 'A marketplace and showcase for pens, pencils, sticky notes, planners, and aesthetic desk supplies. Members share unique paper designs, ink colors, pen reviews, and organizing stationery collections.'
  },

  // Gaming/tech (5)
  {
    name: 'pcgaming',
    description: 'A community dedicated to PC games, hardware upgrades, digital storefronts, and gaming news. Discussions cover high-performance graphics cards, game reviews, frame rates, and PC game development trends.'
  },
  {
    name: 'mechanicalkeyboards',
    description: 'A forum for mechanical keyboard enthusiasts featuring custom keycaps, switches, and custom-built cases. Members share layout designs, soldering guides, tactile typing audio reviews, and clean desk setups.'
  },
  {
    name: 'buildapc',
    description: 'A community helping users select components and assemble custom desktop PCs. Discussions focus on compatibility, liquid cooling, power supply efficiency, cable management, and high-performance processing units.'
  },
  {
    name: 'gaming',
    description: 'A large general community discussing video games, console news, gaming culture, and developer announcements. It covers modern gaming hardware, visual assets, e-sports tournaments, and multi-player gaming experiences.'
  },
  {
    name: 'techsetups',
    description: 'A visual showcase of desk layouts, dual-monitor mounts, RGB lighting arrangements, and clean cable setups. Discussions emphasize high-tech ergonomics, workspace aesthetics, and computing hardware organization.'
  },

  // Fashion/lifestyle (4)
  {
    name: 'streetwear',
    description: 'A fashion community highlighting youth culture, sneaker collections, vintage items, and modern streetwear brands. Discussions focus on outfit styling, brand styling, sizing guides, and urban lifestyle aesthetics.'
  },
  {
    name: 'malefashionadvice',
    description: 'A guide to men\'s styling, cover fits, seasonal trends, and high-quality clothing brands. Discussions cover business casual styles, boots, tailoring, color matching, and building a versatile wardrobe.'
  },
  {
    name: 'femalefashionadvice',
    description: 'A platform discussing styling tips, outfit coordination, and sustainable fashion choices for women. Members share capsule wardrobe advice, brand reviews, styling guides, and vintage thrift store finds.'
  },
  {
    name: 'skincareaddiction',
    description: 'A community focused on skincare routines, product ingredients, sunscreens, and dermatological advice. Discussions cover moisturizers, anti-aging solutions, skin barrier repair, and custom skincare product reviews.'
  },

  // Food/creative (4)
  {
    name: 'coffee',
    description: 'A community dedicated to specialty coffee, espresso brewing, and coffee bean roasting. Discussions cover manual grinders, pour-over techniques, water chemistry, milk steaming, and local coffee culture.'
  },
  {
    name: 'cooking',
    description: 'A recipe-sharing forum covering culinary techniques, kitchen tools, and meal planning. Conversations focus on flavor chemistry, knife skills, food preparation, and home-cooked international cuisines.'
  },
  {
    name: 'photography',
    description: 'A forum for amateur and professional photographers to share camera gear, lighting setups, and editing tutorials. Members discuss lens choices, sensor sizes, composition techniques, and visual brand guides.'
  },
  {
    name: 'art',
    description: 'A general art gallery showcasing paintings, digital illustrations, sculptures, and creative portfolios. Discussions cover physical art techniques, paint brushes, color theory, and creative inspiration.'
  }
];

export async function fetchSubredditDescription(name: string): Promise<string> {
  const fallback = subreddits.find(s => s.name.toLowerCase() === name.toLowerCase())?.description || '';
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const res = await fetch(`https://www.reddit.com/r/${name}/about.json`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });
    clearTimeout(timeoutId);
    
    if (!res.ok) return fallback;
    const json = await res.json();
    return json.data?.public_description || json.data?.description || fallback;
  } catch {
    return fallback;
  }
}
