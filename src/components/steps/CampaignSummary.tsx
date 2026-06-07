'use client';

import React, { useState } from 'react';
import { useAppState } from '../providers/AppStateProvider';

export default function CampaignSummary() {
  const { state, dispatch } = useAppState();
  const { adConcepts } = state;
  const [showToast, setShowToast] = useState(false);

  const acceptedAds = adConcepts.filter(ad => ad.accepted);

  const handlePublish = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  const handleRestart = () => {
    dispatch({ type: 'RESET_STATE' });
  };

  const getSceneLine = (prompt: string) => {
    const lines = prompt.split('\n');
    const sceneLine = lines.find(l => l.trim().toLowerCase().startsWith('scene:'));
    if (sceneLine) {
      return sceneLine.replace(/^scene:/i, '').trim();
    }
    return 'Ad creative concept';
  };

  return (
    <div className="flex-1 flex flex-col justify-between max-w-4xl mx-auto w-full py-4 relative">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Campaign Summary</h1>
          <p className="text-ytTextSecondary text-sm mt-1">Review your compiled campaign settings and submit for review.</p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Accepted Ads List */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Active Ad Creatives ({acceptedAds.length})</h3>
            
            {acceptedAds.length === 0 ? (
              <div className="text-center bg-ytSurface border border-ytBorder p-10 rounded text-ytTextSecondary text-sm select-none">
                No active ads accepted. Go back to Generate to accept creatives.
              </div>
            ) : (
              <div className="space-y-4">
                {acceptedAds.map(ad => (
                  <div key={ad.id} className="bg-ytSurface border border-ytBorder rounded p-4 flex space-x-4">
                    {/* Thumbnail */}
                    <div className="w-24 h-24 md:w-32 md:h-18 aspect-video bg-ytBackground rounded overflow-hidden flex-shrink-0">
                      <img src={ad.imageUrl} alt={ad.concept.cluster.label} className="w-full h-full object-cover" />
                    </div>
                    {/* Brief details */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex justify-between items-start">
                        <span className="bg-ytBackground text-white text-[10px] font-semibold px-2 py-0.5 rounded border border-ytBorder truncate max-w-[150px]">
                          {ad.concept.cluster.label}
                        </span>
                        <span className="text-[10px] text-ytTextSecondary font-mono">
                          Match: {Math.round(ad.concept.cluster.similarity * 100)}%
                        </span>
                      </div>
                      <p className="text-xs text-white leading-normal line-clamp-2">
                        <span className="text-[#888888] font-medium">Scene:</span> {getSceneLine(ad.concept.prompt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Campaign details & Publish box */}
          <div className="bg-ytSurface border border-ytBorder rounded p-5 space-y-6 h-fit">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Campaign Overview</h3>
            
            <div className="space-y-4 text-xs">
              <div className="flex justify-between border-b border-ytBorder pb-2">
                <span className="text-ytTextSecondary">Target product:</span>
                <span className="text-white font-medium truncate max-w-[120px]">{state.product?.name}</span>
              </div>
              <div className="flex justify-between border-b border-ytBorder pb-2">
                <span className="text-ytTextSecondary">Total segments:</span>
                <span className="text-white font-medium">{acceptedAds.length}</span>
              </div>
              <div className="flex justify-between border-b border-ytBorder pb-2">
                <span className="text-ytTextSecondary">Est. review time:</span>
                <span className="text-white font-medium">24 Hours</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={handlePublish}
                disabled={acceptedAds.length === 0}
                className="w-full bg-ytRed hover:bg-ytRed/90 disabled:bg-[#3f3f3f] disabled:text-[#888888] text-white font-medium rounded text-sm px-4 min-h-[44px] transition-colors shadow-md disabled:shadow-none flex items-center justify-center"
              >
                Publish Campaign
              </button>
              
              <p className="text-[11px] text-ytTextSecondary leading-relaxed text-center">
                {"YouTube's team will review your ads before they reach viewers."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="border-t border-ytBorder mt-12 pt-4 flex justify-between items-center">
        <button
          onClick={() => dispatch({ type: 'SET_STEP', payload: 6 })}
          className="border border-ytBorder hover:bg-[#1f1f1f] text-white font-medium rounded text-sm px-6 min-h-[44px] transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleRestart}
          className="text-ytRed hover:underline font-medium text-sm px-4 min-h-[44px]"
        >
          Create New Campaign
        </button>
      </div>

      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-ytSurface border-l-4 border-l-ytGreen border-ytBorder text-white text-sm px-5 py-4 rounded shadow-2xl z-50 flex items-center space-x-3 animate-fade-in select-none">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-ytGreen flex-shrink-0">
            <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
          </svg>
          <div className="space-y-0.5">
            <p className="font-semibold">Campaign submitted</p>
            <p className="text-xs text-ytTextSecondary">Your ads will go live after review.</p>
          </div>
        </div>
      )}
    </div>
  );
}
