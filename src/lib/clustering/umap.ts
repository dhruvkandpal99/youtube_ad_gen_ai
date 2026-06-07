import { UMAP } from 'umap-js';

export function reduceTo2D(vectors: number[][]): [number, number][] {
  if (vectors.length === 0) return [];
  const nNeighbors = Math.max(2, Math.min(15, vectors.length - 1));
  const umap = new UMAP({
    nComponents: 2,
    nNeighbors,
    minDist: 0.1,
    nEpochs: 200,
  });
  const results = umap.fit(vectors);
  return results as [number, number][];
}
