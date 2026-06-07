export type Provider = 'gemini' | 'openai' | 'stability'

export type APIKeys = {
  imageProvider: Provider
  imageKey: string
  textProvider: 'gemini' | 'openai'
  textKey: string
}

export type Product = {
  id: string
  name: string
  tagline: string
  isExample: boolean
  assetUrl: string
  productInfo: string
  brandStyle: string
  embeddingText: string
}

export type Subreddit = {
  name: string
  description: string
  vector?: number[]
}

export type Cluster = {
  id: string
  centroid: number[]
  subreddits: Subreddit[]
  label: string
  similarity: number
  isMatched: boolean
  point2d: [number, number]
}

export type PromptConcept = {
  id: string
  cluster: Cluster
  prompt: string
  approved: boolean
  edited: boolean
}

export type AdConcept = {
  id: string
  concept: PromptConcept
  imageUrl: string
  accepted: boolean
}

export type AppState = {
  step: number
  product: Product | null
  apiKeys: APIKeys | null
  subreddits: Subreddit[]
  clusters: Cluster[]
  matchedClusters: Cluster[]
  promptConcepts: PromptConcept[]
  adConcepts: AdConcept[]
  isDemo: boolean
}
