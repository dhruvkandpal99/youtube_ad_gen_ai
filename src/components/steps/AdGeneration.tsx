'use client';

import React, { useEffect, useState } from 'react';
import { useAppState } from '../providers/AppStateProvider';
import AdCard from '../ui/AdCard';
import { generateImage } from '@/lib/ai/generateImage';
import { generatePrompt } from '@/lib/ai/generatePrompt';
import { AdConcept, PromptConcept } from '@/types';

export default function AdGeneration() {
  const { state, dispatch } = useAppState();
  const { product, promptConcepts, adConcepts, apiKeys } = state;
  const [addingNewConcept, setAddingNewConcept] = useState(false);

  // Initialize and run image generation for approved prompts
  useEffect(() => {
    if (!product) return;

    const approved = promptConcepts.filter(c => c.approved);
    
    // Check if we need to create placeholders
    const existingIds = new Set(adConcepts.map(ad => ad.concept.id));
    const missing = approved.filter(p => !existingIds.has(p.id));

    if (missing.length > 0) {
      // 1. Create placeholders first
      const placeholders: AdConcept[] = missing.map(p => ({
        id: `ad-${p.id}-${Math.random().toString(36).substring(2, 9)}`,
        concept: p,
        imageUrl: '',
        accepted: false,
      }));

      // Append placeholders to state
      const nextAdConcepts = [...adConcepts, ...placeholders];
      dispatch({ type: 'SET_AD_CONCEPTS', payload: nextAdConcepts });

      // 2. Trigger async calls for each placeholder
      missing.forEach((p, idx) => {
        const placeholderId = placeholders[idx].id;
        
        // Async generate
        generateImage(p.prompt, apiKeys)
          .then(url => {
            dispatch({
              type: 'SET_AD_CONCEPTS',
              payload: nextAdConcepts.map(ad => 
                ad.id === placeholderId ? { ...ad, imageUrl: url } : ad
              ),
            });
          })
          .catch(err => {
            console.error('Error generating image', err);
          });
      });
    }
  }, [promptConcepts, product, adConcepts, apiKeys, dispatch]);

  if (!product) return null;

  const handleAccept = (id: string) => {
    const updated = adConcepts.map(ad => 
      ad.id === id ? { ...ad, accepted: !ad.accepted } : ad
    );
    dispatch({ type: 'SET_AD_CONCEPTS', payload: updated });
  };

  const handleReject = (id: string) => {
    // Rejects remove the card from the list
    const updated = adConcepts.filter(ad => ad.id !== id);
    dispatch({ type: 'SET_AD_CONCEPTS', payload: updated });
  };

  const handleRegenerate = async (id: string) => {
    const targetAd = adConcepts.find(ad => ad.id === id);
    if (!targetAd) return;

    // Call generateImage API
    const url = await generateImage(targetAd.concept.prompt, apiKeys);
    
    // Update imageUrl in state
    const updated = adConcepts.map(ad => 
      ad.id === id ? { ...ad, imageUrl: url, accepted: false } : ad
    );
    dispatch({ type: 'SET_AD_CONCEPTS', payload: updated });
  };

  const handleGoBackAndGenerateNew = async () => {
    if (state.matchedClusters.length === 0) return;
    setAddingNewConcept(true);
    try {
      // Pick a random cluster, generate new brief
      const cluster = state.matchedClusters[Math.floor(Math.random() * state.matchedClusters.length)];
      const text = await generatePrompt(product, cluster, apiKeys);
      
      const newPrompt: PromptConcept = {
        id: Math.random().toString(),
        cluster,
        prompt: text,
        approved: true, // Auto-approve to trigger image generation immediately
        edited: false,
      };

      // Add to promptConcepts, redirect to Step 5 so they see it, or keep it approved and go back to Step 5
      dispatch({
        type: 'SET_PROMPT_CONCEPTS',
        payload: [...promptConcepts, newPrompt],
      });
      
      // Go back to Step 5 PromptReview to let user inspect
      dispatch({ type: 'SET_STEP', payload: 5 });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Error creating another brief';
      alert(errMsg);
    } finally {
      setAddingNewConcept(false);
    }
  };

  const handleContinue = () => {
    dispatch({ type: 'SET_STEP', payload: 7 });
  };

  const handleBack = () => {
    dispatch({ type: 'SET_STEP', payload: 5 });
  };

  const approved = promptConcepts.filter(c => c.approved);
  const isCustom = !product.isExample;
  const hasAccepted = adConcepts.some(ad => ad.accepted);

  return (
    <div className="flex-1 flex flex-col justify-between max-w-4xl mx-auto w-full py-4 space-y-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Creative Generation</h1>
          <p className="text-ytTextSecondary text-sm mt-1">Review generated image concepts. Accept the ones you like to publish in the final campaign.</p>
        </div>

        {/* Ad Cards Grid */}
        {approved.length === 0 ? (
          <div className="text-center bg-ytSurface border border-ytBorder p-10 rounded text-ytTextSecondary text-sm select-none">
            No approved briefs. Please go back and approve at least one brief.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adConcepts.map(ad => (
              <AdCard
                key={ad.id}
                ad={ad}
                product={product}
                onAccept={handleAccept}
                onReject={handleReject}
                onRegenerate={handleRegenerate}
              />
            ))}
          </div>
        )}

        {/* Generate Another Concept for Custom Product */}
        {isCustom && (
          <div className="flex justify-center pt-2">
            <button
              onClick={handleGoBackAndGenerateNew}
              disabled={addingNewConcept}
              className="border border-dashed border-ytBorder hover:border-white text-ytTextSecondary hover:text-white font-medium rounded text-sm px-6 min-h-[44px] transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {addingNewConcept && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>+ Generate another concept</span>
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="border-t border-ytBorder mt-8 pt-4 flex justify-between items-center">
        <button
          onClick={handleBack}
          className="border border-ytBorder hover:bg-[#1f1f1f] text-white font-medium rounded text-sm px-6 min-h-[44px] transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!hasAccepted}
          className="bg-ytRed hover:bg-ytRed/90 disabled:bg-[#3f3f3f] disabled:text-[#888888] text-white font-medium rounded text-sm px-6 min-h-[44px] transition-colors shadow-md disabled:shadow-none"
        >
          Review Campaign Summary →
        </button>
      </div>
    </div>
  );
}
