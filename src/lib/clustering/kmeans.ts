import { cosineSimilarity } from './cosine';

export function kmeans(vectors: number[][], k: number, iterations = 100): { centroids: number[][]; assignments: number[] } {
  const n = vectors.length, d = vectors[0]?.length || 0;
  let centroids = vectors.slice(0, k).map(v => [...v]);
  while (centroids.length < k) centroids.push(new Array(d).fill(0));

  const assignments = new Array(n).fill(-1);
  for (let iter = 0; iter < iterations; iter++) {
    let changed = false;
    const nextAssignments = vectors.map(v => {
      let maxSim = -Infinity, idx = 0;
      centroids.forEach((c, cIdx) => {
        const sim = cosineSimilarity(v, c);
        if (sim > maxSim) { maxSim = sim; idx = cIdx; }
      });
      return idx;
    });

    for (let i = 0; i < n; i++) {
      if (nextAssignments[i] !== assignments[i]) { assignments[i] = nextAssignments[i]; changed = true; }
    }
    if (!changed) break;

    const newCentroids = Array.from({ length: k }, () => new Array(d).fill(0));
    const counts = new Array(k).fill(0);
    assignments.forEach((cIdx, i) => {
      counts[cIdx]++;
      for (let j = 0; j < d; j++) newCentroids[cIdx][j] += vectors[i][j];
    });

    centroids = newCentroids.map((sumVec, cIdx) => {
      if (counts[cIdx] === 0) return [...vectors[Math.floor(Math.random() * n)]];
      const c = sumVec.map(sum => sum / counts[cIdx]);
      const mag = Math.sqrt(c.reduce((s, v) => s + v * v, 0));
      return mag > 0 ? c.map(v => v / mag) : c;
    });
  }
  return { centroids, assignments };
}
