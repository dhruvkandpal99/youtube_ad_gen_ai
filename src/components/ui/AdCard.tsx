'use client';

import React, { useState } from 'react';
import { AdConcept, Product } from '@/types';
import RAGChat from './RAGChat';

type AdCardProps = {
  ad: AdConcept;
  product: Product;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onRegenerate: (id: string) => Promise<void>;
};

export default function AdCard({ ad, product, onAccept, onReject, onRegenerate }: AdCardProps) {
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerateClick = async () => {
    setIsRegenerating(true);
    try {
      await onRegenerate(ad.id);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      alert(errMsg);
    } finally {
      setIsRegenerating(false);
    }
  };

  const isGenerating = (!ad.imageUrl && !ad.error) || isRegenerating;

  return (
    <div
      className={`bg-ytSurface rounded border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
        ad.accepted 
          ? 'border-ytGreen shadow-[0_0_12px_rgba(43,166,64,0.15)] ring-1 ring-ytGreen' 
          : 'border-ytBorder'
      }`}
    >
      {/* 16:9 Image or Shimmer or Error */}
      <div className="relative aspect-video w-full bg-ytBackground overflow-hidden">
        {ad.error && !isRegenerating ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[#1e1010] border-b border-[#3d1313] text-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-ytRed mb-2 animate-pulse">
              <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.401 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
            </svg>
            <div className="text-xs font-semibold uppercase tracking-wider text-ytRed">Generation Failed</div>
            <div className="text-[11px] text-[#aaaaaa] mt-1 line-clamp-3 select-text font-mono max-w-xs overflow-y-auto max-h-[50px] leading-relaxed">
              {ad.error}
            </div>
          </div>
        ) : isGenerating ? (
          <div className="w-full h-full animate-shimmer flex items-center justify-center relative p-6">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-6 h-6 border-2 border-ytRed border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold text-white tracking-wide uppercase">
                {isRegenerating ? 'Regenerating' : 'Generating'} {ad.concept.cluster.label} Creative...
              </span>
            </div>
          </div>
        ) : (
          <img
            src={ad.imageUrl}
            alt={ad.concept.cluster.label}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        )}
      </div>

      <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Metadata Row */}
          <div className="flex justify-between items-center">
            <span className="bg-ytBackground text-white text-[11px] font-semibold px-2 py-0.5 rounded border border-ytBorder">
              {ad.concept.cluster.label}
            </span>
            <span className="text-[11px] text-ytTextSecondary font-mono">
              Similarity: {Math.round(ad.concept.cluster.similarity * 100)}%
            </span>
          </div>

          {/* View Prompt Collapsible */}
          <div className="border border-ytBorder rounded">
            <button
              onClick={() => setIsPromptOpen(!isPromptOpen)}
              className="w-full px-3 py-2 text-left text-xs font-medium text-white hover:bg-ytBackground transition-colors flex justify-between items-center"
            >
              <span>{isPromptOpen ? 'Hide Brief Details' : 'View Brief Details'}</span>
              <span className="text-[10px] text-ytTextSecondary">
                {isPromptOpen ? '▲' : '▼'}
              </span>
            </button>
            {isPromptOpen && (
              <div className="p-3 bg-ytBackground border-t border-ytBorder font-mono text-[10px] leading-relaxed text-ytTextSecondary max-h-[150px] overflow-y-auto whitespace-pre-wrap">
                {ad.concept.prompt}
              </div>
            )}
          </div>

          {/* Interactive RAG Chat */}
          <RAGChat product={product} />
        </div>

        {/* Action Controls Row */}
        <div className="flex space-x-2 pt-3 border-t border-ytBorder mt-4">
          <button
            onClick={() => onReject(ad.id)}
            className="flex-1 border border-ytRed/40 hover:border-ytRed hover:bg-ytRed/10 text-ytRed font-medium text-xs rounded min-h-[38px] transition-colors"
          >
            Reject ✗
          </button>
          <button
            onClick={handleRegenerateClick}
            disabled={isGenerating}
            className="flex-1 border border-ytBorder hover:bg-[#3f3f3f] disabled:opacity-50 text-white font-medium text-xs rounded min-h-[38px] transition-colors flex items-center justify-center space-x-1"
          >
            <span>Regenerate ↺</span>
          </button>
          <button
            onClick={() => onAccept(ad.id)}
            className={`flex-1 font-medium text-xs rounded min-h-[38px] transition-colors ${
              ad.accepted
                ? 'bg-ytGreen/15 border border-ytGreen text-ytGreen hover:bg-ytGreen/25'
                : 'bg-ytGreen hover:bg-ytGreen/90 text-white shadow-md'
            }`}
          >
            {ad.accepted ? 'Accepted ✓' : 'Accept ✓'}
          </button>
        </div>
      </div>
    </div>
  );
}
