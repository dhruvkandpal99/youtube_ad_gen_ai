'use client';

import React, { useState } from 'react';
import { useAppState } from '../providers/AppStateProvider';
import PromptCard from '../ui/PromptCard';
import { generatePrompt } from '@/lib/ai/generatePrompt';

export default function PromptReview() {
  const { state, dispatch } = useAppState();
  const { product, promptConcepts, apiKeys } = state;
  const [generatingConcept, setGeneratingConcept] = useState(false);

  if (!product) return null;

  const handleApprove = (id: string) => {
    const updated = promptConcepts.map(c => 
      c.id === id ? { ...c, approved: !c.approved } : c
    );
    dispatch({ type: 'SET_PROMPT_CONCEPTS', payload: updated });
  };

  const handleDiscard = (id: string) => {
    const updated = promptConcepts.filter(c => c.id !== id);
    dispatch({ type: 'SET_PROMPT_CONCEPTS', payload: updated });
  };

  const handleUpdate = (id: string, newText: string) => {
    const updated = promptConcepts.map(c => 
      c.id === id ? { ...c, prompt: newText, edited: true } : c
    );
    dispatch({ type: 'SET_PROMPT_CONCEPTS', payload: updated });
  };

  const handleGenerateAnother = async () => {
    if (state.matchedClusters.length === 0) return;
    setGeneratingConcept(true);
    try {
      // Pick a random cluster to generate another concept for
      const cluster = state.matchedClusters[Math.floor(Math.random() * state.matchedClusters.length)];
      const text = await generatePrompt(product, cluster, apiKeys);
      const newConcept = {
        id: Math.random().toString(),
        cluster,
        prompt: text,
        approved: false,
        edited: false,
      };
      dispatch({
        type: 'SET_PROMPT_CONCEPTS',
        payload: [...promptConcepts, newConcept],
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Error generating new ad brief';
      alert(errMsg);
    } finally {
      setGeneratingConcept(false);
    }
  };

  const handleContinue = () => {
    // Only transition approved concepts to the next step
    dispatch({ type: 'SET_STEP', payload: 6 });
  };

  const handleBack = () => {
    dispatch({ type: 'SET_STEP', payload: 4 });
  };

  const isCustom = !product.isExample;
  const hasApproved = promptConcepts.some(c => c.approved);

  return (
    <div className="flex-1 flex flex-col justify-between max-w-4xl mx-auto w-full py-4 space-y-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Review Ad Briefs</h1>
          <p className="text-ytTextSecondary text-sm mt-1">Approve at least one ad brief to proceed with creative generation. You can edit any brief before approving.</p>
        </div>

        {/* Prompt Cards list */}
        <div className="space-y-6">
          {promptConcepts.length === 0 ? (
            <div className="text-center bg-ytSurface border border-ytBorder p-10 rounded text-ytTextSecondary text-sm select-none">
              No briefs available. Go back to Discovery to regenerate.
            </div>
          ) : (
            promptConcepts.map(concept => (
              <PromptCard
                key={concept.id}
                concept={concept}
                onApprove={handleApprove}
                onDiscard={handleDiscard}
                onUpdate={handleUpdate}
              />
            ))
          )}
        </div>

        {/* Generate Another Button for Custom Products */}
        {isCustom && (
          <div className="flex justify-center pt-2">
            <button
              onClick={handleGenerateAnother}
              disabled={generatingConcept}
              className="border border-dashed border-ytBorder hover:border-white text-ytTextSecondary hover:text-white font-medium rounded text-sm px-6 min-h-[44px] transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {generatingConcept && (
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
          disabled={!hasApproved}
          className="bg-ytRed hover:bg-ytRed/90 disabled:bg-[#3f3f3f] disabled:text-[#888888] text-white font-medium rounded text-sm px-6 min-h-[44px] transition-colors shadow-md disabled:shadow-none"
        >
          Generate Ads →
        </button>
      </div>
    </div>
  );
}
