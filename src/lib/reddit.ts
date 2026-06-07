import { fetchSubredditDescription as fetchDesc } from '../data/subreddits';

export async function fetchSubredditDescription(name: string): Promise<string> {
  return fetchDesc(name);
}
