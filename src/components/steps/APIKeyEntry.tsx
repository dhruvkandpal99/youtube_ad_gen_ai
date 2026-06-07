'use client';

import React, { useState } from 'react';
import { useAppState } from '../providers/AppStateProvider';
import { Provider } from '@/types';

export default function APIKeyEntry() {
  const { state, dispatch } = useAppState();
  const product = state.product;

  const [imageProvider, setImageProvider] = useState<Provider>(state.apiKeys?.imageProvider || 'gemini');
  const [imageKey, setImageKey] = useState(state.apiKeys?.imageKey || '');
  const [showImageKey, setShowImageKey] = useState(false);

  const [textProvider, setTextProvider] = useState<'gemini' | 'openai'>(state.apiKeys?.textProvider || 'gemini');
  const [textKey, setTextKey] = useState(state.apiKeys?.textKey || '');
  const [showTextKey, setShowTextKey] = useState(false);

  if (!product) return null;

  const handleStartAnalysis = () => {
    const hasKeys = imageKey.trim() !== '';
    if (hasKeys) {
      dispatch({
        type: 'SET_API_KEYS',
        payload: {
          imageProvider,
          imageKey,
          textProvider,
          textKey: textKey.trim() !== '' ? textKey : imageKey, // Use imageKey as fallback for text provider if only one is supplied, or keep separate
        },
      });
      dispatch({ type: 'SET_DEMO', payload: false });
    } else {
      dispatch({ type: 'SET_DEMO', payload: true });
    }
    dispatch({ type: 'SET_STEP', payload: 4 });
  };

  const handleContinueDemo = () => {
    dispatch({ type: 'SET_API_KEYS', payload: null });
    dispatch({ type: 'SET_DEMO', payload: true });
    dispatch({ type: 'SET_STEP', payload: 4 });
  };

  const handleBack = () => {
    dispatch({ type: 'SET_STEP', payload: 2 });
  };

  const isExample = product.isExample;
  const isStartActive = isExample || imageKey.trim() !== '';

  return (
    <div className="flex-1 flex flex-col justify-between max-w-xl mx-auto w-full py-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">API Configuration</h1>
          <p className="text-ytTextSecondary text-sm mt-1">Configure AI credentials to run live embedding searches and asset generations.</p>
        </div>

        <div className="bg-ytSurface border border-ytBorder rounded p-6 space-y-6 divide-y divide-ytBorder">
          {/* Section 1 - Image Generation */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Section 1 — Image Generation</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col col-span-1">
                <label className="text-xs font-semibold text-ytTextSecondary mb-1.5">Provider</label>
                <select
                  value={imageProvider}
                  onChange={e => setImageProvider(e.target.value as Provider)}
                  className="bg-ytBackground border border-ytBorder focus:border-ytRed outline-none rounded text-white text-sm px-3 h-10 cursor-pointer"
                >
                  <option value="gemini">Gemini</option>
                  <option value="openai">OpenAI</option>
                  <option value="stability">Stability AI</option>
                </select>
              </div>
              <div className="flex flex-col col-span-2">
                <label className="text-xs font-semibold text-ytTextSecondary mb-1.5">API Key</label>
                <div className="relative">
                  <input
                    type={showImageKey ? 'text' : 'password'}
                    value={imageKey}
                    onChange={e => setImageKey(e.target.value)}
                    placeholder={`Enter ${imageProvider} API key`}
                    className="bg-ytBackground border border-ytBorder focus:border-ytRed outline-none rounded text-white text-sm pl-4 pr-10 h-10 w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowImageKey(!showImageKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ytTextSecondary hover:text-white text-xs font-medium"
                  >
                    {showImageKey ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 - Text and Embeddings */}
          <div className="space-y-4 pt-6">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Section 2 — Text & Embeddings</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col col-span-1">
                <label className="text-xs font-semibold text-ytTextSecondary mb-1.5">Provider</label>
                <select
                  value={textProvider}
                  onChange={e => setTextProvider(e.target.value as 'gemini' | 'openai')}
                  className="bg-ytBackground border border-ytBorder focus:border-ytRed outline-none rounded text-white text-sm px-3 h-10 cursor-pointer"
                >
                  <option value="gemini">Gemini</option>
                  <option value="openai">OpenAI</option>
                </select>
              </div>
              <div className="flex flex-col col-span-2">
                <label className="text-xs font-semibold text-ytTextSecondary mb-1.5">API Key</label>
                <div className="relative">
                  <input
                    type={showTextKey ? 'text' : 'password'}
                    value={textKey}
                    onChange={e => setTextKey(e.target.value)}
                    placeholder={`Enter ${textProvider} API key (optional)`}
                    className="bg-ytBackground border border-ytBorder focus:border-ytRed outline-none rounded text-white text-sm pl-4 pr-10 h-10 w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTextKey(!showTextKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ytTextSecondary hover:text-white text-xs font-medium"
                  >
                    {showTextKey ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Small Notice */}
        <p className="text-center text-xs text-ytTextSecondary">
          Your keys are never sent to our servers. All calls go directly from your browser to the provider.{' '}
          <a
            href="https://github.com/dhruvkandpal/youtube_ad_gen_ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:underline inline-flex items-center space-x-0.5"
          >
            <span>View source</span>
            <span>↗</span>
          </a>
        </p>
      </div>

      {/* Action Buttons */}
      <div className="border-t border-ytBorder mt-8 pt-4 flex justify-between items-center">
        <button
          onClick={handleBack}
          className="border border-ytBorder hover:bg-[#1f1f1f] text-white font-medium rounded text-sm px-6 min-h-[44px] transition-colors"
        >
          Back
        </button>
        <div className="flex items-center space-x-3">
          {isExample && (
            <button
              onClick={handleContinueDemo}
              className="border border-[#888888] hover:border-white hover:bg-[#1f1f1f] text-ytTextSecondary hover:text-white font-medium rounded text-sm px-6 min-h-[44px] transition-colors"
            >
              Continue in demo mode
            </button>
          )}
          <button
            onClick={handleStartAnalysis}
            disabled={!isStartActive}
            className="bg-ytRed hover:bg-ytRed/90 disabled:bg-[#3f3f3f] disabled:text-[#888888] text-white font-medium rounded text-sm px-6 min-h-[44px] transition-colors shadow-md disabled:shadow-none"
          >
            Start analysis →
          </button>
        </div>
      </div>
    </div>
  );
}
