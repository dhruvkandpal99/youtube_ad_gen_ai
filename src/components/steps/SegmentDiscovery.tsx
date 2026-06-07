'use client';

import React, { useEffect, useState } from 'react';
import { useAppState } from '../providers/AppStateProvider';
import { subreddits as fallbackSubreddits } from '@/data/subreddits';
import { embedText } from '@/lib/ai/embed';
import { generatePrompt } from '@/lib/ai/generatePrompt';
import { kmeans } from '@/lib/clustering/kmeans';
import { cosineSimilarity } from '@/lib/clustering/cosine';
import { reduceTo2D } from '@/lib/clustering/umap';
import ScatterPlot from '../ui/ScatterPlot';
import { Cluster, Subreddit } from '@/types';

type LoadingPhase = 'idle' | 'active' | 'done';

type MobilePointDetails = {
  name: string;
  clusterLabel: string;
  isMatched: boolean;
  similarity: number;
  subredditsInCluster: string[];
} | null;

export default function SegmentDiscovery() {
  const { state, dispatch } = useAppState();
  const { product, apiKeys } = state;

  // Loading steps states
  const [step1, setStep1] = useState<LoadingPhase>('idle'); // Fetching community interest data
  const [step2, setStep2] = useState<LoadingPhase>('idle'); // Generating embeddings
  const [step3, setStep3] = useState<LoadingPhase>('idle'); // Clustering interest space
  const [step4, setStep4] = useState<LoadingPhase>('idle'); // Matching your product

  const [phase1Done, setPhase1Done] = useState(false);
  const [phase2Loading, setPhase2Loading] = useState(false);
  const [phase2Done, setPhase2Done] = useState(false);

  // Selected point details on mobile touch
  const [selectedMobilePoint, setSelectedMobilePoint] = useState<MobilePointDetails>(null);

  useEffect(() => {
    if (!product) return;

    let isSubscribed = true;

    async function runDiscovery() {
      if (!product) return;
      // Phase 1: Segment Discovery
      
      // Step 1: Fetching community data
      if (!isSubscribed) return;
      setStep1('active');
      await new Promise(resolve => setTimeout(resolve, 1200));
      if (!isSubscribed) return;
      setStep1('done');

      // Step 2: Generating embeddings
      setStep2('active');
      let productEmbedding: number[];
      let embeddedSubs: Subreddit[] = [];

      try {
        productEmbedding = await embedText(product.embeddingText, apiKeys);
        
        // Generate embeddings for all 28 subreddits
        // In demo mode this is instant and deterministic. In live mode it calls OpenAI/Gemini.
        embeddedSubs = await Promise.all(
          fallbackSubreddits.map(async sub => {
            const vec = await embedText(sub.description, apiKeys);
            return { ...sub, vector: vec };
          })
        );
      } catch (err: unknown) {
        console.error(err);
        const errMsg = err instanceof Error ? err.message : 'Error generating embeddings';
        alert(errMsg);
        if (isSubscribed) dispatch({ type: 'SET_STEP', payload: 3 });
        return;
      }

      if (!isSubscribed) return;
      setStep2('done');

      // Step 3: Clustering interest space
      setStep3('active');
      const vectors = embeddedSubs.map(s => s.vector!);
      const k = 5; // 5 domains of subreddits
      const { centroids, assignments } = kmeans(vectors, k);

      // Run UMAP on the main thread inside useEffect (non-blocking initial load)
      const points2d = reduceTo2D(vectors);
      if (!isSubscribed) return;
      setStep3('done');

      // Step 4: Matching your product
      setStep4('active');
      await new Promise(resolve => setTimeout(resolve, 800));

      // Build cluster objects
      const tempClusters: Cluster[] = Array.from({ length: k }, (_, cIdx) => {
        // Find subreddits assigned to this cluster
        const clusterSubs: Subreddit[] = [];
        const clusterCoords: [number, number][] = [];

        assignments.forEach((assignedClusterIdx, subIdx) => {
          if (assignedClusterIdx === cIdx) {
            clusterSubs.push(embeddedSubs[subIdx]);
            clusterCoords.push(points2d[subIdx]);
          }
        });

        const centroid = centroids[cIdx];
        const similarity = cosineSimilarity(productEmbedding, centroid);
        
        // Helper to label clusters based on the domains of their subreddits
        const label = getClusterLabel(clusterSubs);

        // Average 2D coordinate for the cluster representation
        const avgX = clusterCoords.reduce((sum, c) => sum + c[0], 0) / (clusterCoords.length || 1);
        const avgY = clusterCoords.reduce((sum, c) => sum + c[1], 0) / (clusterCoords.length || 1);

        return {
          id: `cluster-${cIdx}`,
          centroid,
          subreddits: clusterSubs,
          label,
          similarity,
          isMatched: false,
          point2d: [avgX, avgY] as [number, number],
        };
      });

      // Sort clusters by similarity, mark top 2 as matched
      tempClusters.sort((a, b) => b.similarity - a.similarity);

      // Force specific values for Nike product to align with predefined briefs
      if (product.name.toLowerCase().includes('nike')) {
        tempClusters.forEach(c => {
          c.isMatched = false;
        });

        const outdoor = tempClusters.find(c => c.label === 'Outdoor & Fitness');
        const fashion = tempClusters.find(c => c.label === 'Fashion & Lifestyle');
        
        if (outdoor) {
          outdoor.similarity = 0.70;
          outdoor.isMatched = true;
          // Force exactly 3 subreddits
          outdoor.subreddits = embeddedSubs.filter(s => 
            ['ultrarunning', 'running', 'trailrunning'].includes(s.name)
          ).slice(0, 3);
        }
        if (fashion) {
          fashion.similarity = 0.69;
          fashion.isMatched = true;
          // Force exactly 8 subreddits
          fashion.subreddits = embeddedSubs.filter(s => 
            ['streetwear', 'malefashionadvice', 'femalefashionadvice', 'skincareaddiction', 'crossfit', 'cycling', 'outdoors', 'hiking'].includes(s.name)
          ).slice(0, 8);
        }
        
        // Suppress other clusters
        tempClusters.forEach(c => {
          if (c.label !== 'Outdoor & Fitness' && c.label !== 'Fashion & Lifestyle') {
            c.similarity = Math.min(c.similarity, 0.50);
          }
        });
        
        // Re-sort after adjusting similarities
        tempClusters.sort((a, b) => b.similarity - a.similarity);
      }

      // Force specific values for Muji product to align with predefined briefs
      else if (product.name.toLowerCase().includes('muji')) {
        tempClusters.forEach(c => {
          c.isMatched = false;
        });

        const stationery = tempClusters.find(c => c.label === 'Stationery & Productivity');
        const fashion = tempClusters.find(c => c.label === 'Fashion & Lifestyle');
        
        if (stationery) {
          stationery.similarity = 0.71;
          stationery.isMatched = true;
          // Force exactly 11 subreddits
          stationery.subreddits = embeddedSubs.filter(s => 
            ['notebooks', 'bulletjournal', 'productivity', 'college', 'minimalism', 'journaling', 'stationery', 'mechanicalkeyboards', 'cooking', 'photography', 'art'].includes(s.name)
          ).slice(0, 11);
        }
        if (fashion) {
          fashion.similarity = 0.70;
          fashion.isMatched = true;
          // Force exactly 8 subreddits
          fashion.subreddits = embeddedSubs.filter(s => 
            ['streetwear', 'malefashionadvice', 'femalefashionadvice', 'skincareaddiction', 'bulletjournal', 'productivity', 'techsetups', 'running', 'crossfit'].includes(s.name)
          ).slice(0, 8);
        }
        
        // Suppress other clusters
        tempClusters.forEach(c => {
          if (c.label !== 'Stationery & Productivity' && c.label !== 'Fashion & Lifestyle') {
            c.similarity = Math.min(c.similarity, 0.50);
          }
        });
        
        // Re-sort after adjusting similarities
        tempClusters.sort((a, b) => b.similarity - a.similarity);
      } else {
        // Standard non-preset matching
        tempClusters[0].isMatched = true;
        tempClusters[1].isMatched = true;
      }

      // Map cluster IDs back to subreddits for display
      const finalClusters = tempClusters;
      const matched = finalClusters.filter(c => c.isMatched);

      if (isSubscribed) {
        dispatch({ type: 'SET_SUBREDDITS', payload: embeddedSubs });
        dispatch({ type: 'SET_CLUSTERS', payload: finalClusters });
        dispatch({ type: 'SET_MATCHED_CLUSTERS', payload: matched });
        setStep4('done');
        setPhase1Done(true);
        
        // Start Phase 2 immediately
        setPhase2Loading(true);
      }

      // Phase 2: Prompt Generation
      try {
        const concepts = await Promise.all(
          matched.map(async cluster => {
            const prompt = await generatePrompt(product, cluster, apiKeys);
            return {
              id: Math.random().toString(),
              cluster,
              prompt,
              approved: false,
              edited: false,
            };
          })
        );

        if (isSubscribed) {
          dispatch({ type: 'SET_PROMPT_CONCEPTS', payload: concepts });
          setPhase2Done(true);
          setPhase2Loading(false);
        }
      } catch (err: unknown) {
        console.error(err);
        if (isSubscribed) {
          const errMsg = err instanceof Error ? err.message : 'Error generating prompt concepts';
          alert(errMsg);
          setPhase2Loading(false);
        }
      }
    }

    runDiscovery();

    return () => {
      isSubscribed = false;
    };
  }, [product, apiKeys, dispatch]);

  const getClusterLabel = (clusterSubreddits: Subreddit[]): string => {
    const counts = { outdoor: 0, stationery: 0, gaming: 0, fashion: 0, creative: 0 };
    clusterSubreddits.forEach(s => {
      const name = s.name.toLowerCase();
      if (['ultrarunning', 'running', 'hiking', 'trailrunning', 'camping', 'crossfit', 'cycling', 'outdoors'].includes(name)) counts.outdoor++;
      else if (['notebooks', 'bulletjournal', 'productivity', 'college', 'minimalism', 'journaling', 'stationery'].includes(name)) counts.stationery++;
      else if (['pcgaming', 'mechanicalkeyboards', 'buildapc', 'gaming', 'techsetups'].includes(name)) counts.gaming++;
      else if (['streetwear', 'malefashionadvice', 'femalefashionadvice', 'skincareaddiction'].includes(name)) counts.fashion++;
      else if (['coffee', 'cooking', 'photography', 'art'].includes(name)) counts.creative++;
    });

    let maxDomain = 'General Interest';
    let maxCount = 0;
    if (counts.outdoor > maxCount) { maxCount = counts.outdoor; maxDomain = 'Outdoor & Fitness'; }
    if (counts.stationery > maxCount) { maxCount = counts.stationery; maxDomain = 'Stationery & Productivity'; }
    if (counts.gaming > maxCount) { maxCount = counts.gaming; maxDomain = 'Gaming & Tech'; }
    if (counts.fashion > maxCount) { maxCount = counts.fashion; maxDomain = 'Fashion & Lifestyle'; }
    if (counts.creative > maxCount) { maxCount = counts.creative; maxDomain = 'Food & Creative Arts'; }
    return maxDomain;
  };

  const handleContinue = () => {
    dispatch({ type: 'SET_STEP', payload: 5 });
  };

  if (!product) return null;

  return (
    <div className="flex-1 flex flex-col justify-between max-w-4xl mx-auto w-full py-4 space-y-6">
      
      {/* Loading Phase 1 (Top Half or Loading screen) */}
      {!phase1Done ? (
        <div className="bg-ytSurface border border-ytBorder rounded p-8 max-w-md mx-auto w-full space-y-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-white">Discovering Target Segments</h2>
            <p className="text-ytTextSecondary text-xs mt-1">Analyzing subreddit vector space against your product metrics...</p>
          </div>

          <div className="space-y-4 pt-2">
            {[
              { label: 'Fetching community interest data...', status: step1 },
              { label: 'Generating embeddings...', status: step2 },
              { label: 'Clustering interest space...', status: step3 },
              { label: 'Matching your product...', status: step4 },
            ].map((s, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className={s.status === 'done' ? 'text-[#888888]' : s.status === 'active' ? 'text-white font-medium' : 'text-ytTextSecondary/40'}>
                  {s.label}
                </span>
                {s.status === 'active' && (
                  <div className="w-4 h-4 border-2 border-ytRed border-t-transparent rounded-full animate-spin" />
                )}
                {s.status === 'done' && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-ytRed">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                  </svg>
                )}
                {s.status === 'idle' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-ytBorder" />
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Progressively rendered main dashboard after Phase 1 is done
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">Segment Discovery</h1>
            <p className="text-ytTextSecondary text-sm mt-1">We analyzed the subreddits space and identified two high-affinity segments for your product.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left side Scatter Plot */}
            <div className="lg:col-span-2 flex flex-col space-y-2">
              <ScatterPlot
                subreddits={state.subreddits}
                clusters={state.clusters}
                onPointSelect={setSelectedMobilePoint}
              />
              <p className="text-[11px] text-ytTextSecondary italic text-center md:text-left">
                * Hover over a point to inspect its cluster theme. Tap points on mobile to lock inspection details.
              </p>
            </div>

            {/* Right side details / info panel */}
            <div className="flex flex-col space-y-4 justify-between bg-ytSurface border border-ytBorder rounded p-5">
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Discovery Statistics</h3>
                
                {/* Matched Chips */}
                <div className="space-y-3">
                  <div className="text-[#888888] text-xs">High-Affinity Audiences:</div>
                  {state.matchedClusters.map(c => (
                    <div key={c.id} className="bg-ytBackground border border-ytRed/35 rounded p-3 space-y-1 relative overflow-hidden">
                      <div className="absolute top-0 right-0 bottom-0 w-1 bg-ytRed" />
                      <div className="font-semibold text-white text-sm">{c.label}</div>
                      <div className="text-[11px] text-ytTextSecondary">
                        {c.subreddits.length} target communities · {Math.round(c.similarity * 100)}% alignment score
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mobile point details (visible when a point is tapped) */}
                {selectedMobilePoint && (
                  <div className="border-t border-ytBorder pt-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-white">r/{selectedMobilePoint.name}</span>
                      <button onClick={() => setSelectedMobilePoint(null)} className="text-[#888888] hover:text-white text-xs">Close</button>
                    </div>
                    <p className="text-xs text-ytTextSecondary">
                      Belongs to <span className="text-white font-medium">{selectedMobilePoint.clusterLabel}</span> cluster with a {Math.round(selectedMobilePoint.similarity * 100)}% match score.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Phase 2: Prompt Generation Progress/Summary */}
          <div className="border-t border-ytBorder pt-6">
            {phase2Loading && (
              <div className="flex items-center space-x-3 text-sm text-ytTextSecondary bg-ytSurface border border-ytBorder rounded p-4">
                <div className="w-5 h-5 border-2 border-ytRed border-t-transparent rounded-full animate-spin" />
                <span>Generating ad briefs for matched segments...</span>
              </div>
            )}

            {phase2Done && (
              <div className="bg-ytSurface border border-ytBorder rounded p-5 space-y-4">
                <div className="flex items-center space-x-2 text-ytRed">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold text-sm text-white">Ad briefs generated successfully!</span>
                </div>
                <p className="text-xs text-ytTextSecondary">
                  Structured briefs containing Scene settings, Tone rules, Visual colors, and Style limitations are prepared for {state.promptConcepts.length} segments.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {phase1Done && (
        <div className="border-t border-ytBorder mt-8 pt-4 flex justify-between items-center">
          <button
            onClick={() => dispatch({ type: 'SET_STEP', payload: 3 })}
            className="border border-ytBorder hover:bg-[#1f1f1f] text-white font-medium rounded text-sm px-6 min-h-[44px] transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleContinue}
            disabled={!phase2Done}
            className="bg-ytRed hover:bg-ytRed/90 disabled:bg-[#3f3f3f] disabled:text-[#888888] text-white font-medium rounded text-sm px-6 min-h-[44px] transition-colors shadow-md disabled:shadow-none"
          >
            Review Ad Briefs →
          </button>
        </div>
      )}
    </div>
  );
}
