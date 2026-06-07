'use client';

import React, { useState } from 'react';
import { useAppState } from '../providers/AppStateProvider';

type Tab = 'image' | 'info' | 'style';

export default function AssetReview() {
  const { state, dispatch } = useAppState();
  const product = state.product;

  const [activeTab, setActiveTab] = useState<Tab>('image');

  // Edit states for custom product
  const [editedInfo, setEditedInfo] = useState(product?.productInfo || '');
  const [editedStyle, setEditedStyle] = useState(product?.brandStyle || '');

  if (!product) {
    return (
      <div className="text-center py-10">
        <p className="text-ytTextSecondary">No product selected. Please go back.</p>
        <button
          onClick={() => dispatch({ type: 'SET_STEP', payload: 1 })}
          className="mt-4 bg-ytRed text-white px-4 py-2 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  const handleContinue = () => {
    if (!product.isExample) {
      // Save any refinements back to state
      dispatch({
        type: 'SET_PRODUCT',
        payload: {
          ...product,
          productInfo: editedInfo,
          brandStyle: editedStyle,
        },
      });
    }
    dispatch({ type: 'SET_STEP', payload: 3 });
  };

  const handleBack = () => {
    dispatch({ type: 'SET_STEP', payload: 1 });
  };

  const isExample = product.isExample;

  return (
    <div className="flex-1 flex flex-col justify-between max-w-4xl mx-auto w-full py-4">
      <div className="space-y-6 flex-1 flex flex-col">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Review Assets</h1>
          <p className="text-ytTextSecondary text-sm mt-1">Verify and refine your product details and brand guidelines before discovery.</p>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-ytBorder">
          {(['image', 'info', 'style'] as Tab[]).map(tab => {
            const isActive = activeTab === tab;
            const label = tab === 'image' ? 'Product Image' : tab === 'info' ? 'Product Info' : 'Style Guide';
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-4 pb-3 text-sm font-medium transition-colors min-h-[44px] ${
                  isActive ? 'text-white' : 'text-ytTextSecondary hover:text-white'
                }`}
              >
                {label}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-ytRed rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-h-[350px] bg-ytSurface border border-ytBorder rounded p-6 overflow-hidden flex flex-col">
          {activeTab === 'image' && (
            <div className="flex-1 flex items-center justify-center">
              <div className="max-w-[400px] w-full border border-ytBorder rounded overflow-hidden bg-ytBackground p-2">
                <img
                  src={product.assetUrl}
                  alt={product.name}
                  className="max-h-[300px] w-full object-contain mx-auto rounded"
                />
              </div>
            </div>
          )}

          {activeTab === 'info' && (
            <div className="flex-1 flex flex-col">
              {isExample ? (
                <pre className="flex-1 overflow-y-auto whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-[#dfdfdf] bg-ytBackground border border-ytBorder rounded p-4">
                  {product.productInfo}
                </pre>
              ) : (
                <textarea
                  value={editedInfo}
                  onChange={e => setEditedInfo(e.target.value)}
                  className="flex-1 bg-ytBackground border border-ytBorder focus:border-ytRed outline-none rounded text-sm p-4 font-mono leading-relaxed text-white resize-none"
                  placeholder="Refine product details..."
                />
              )}
            </div>
          )}

          {activeTab === 'style' && (
            <div className="flex-1 flex flex-col">
              {isExample ? (
                <pre className="flex-1 overflow-y-auto whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-[#dfdfdf] bg-ytBackground border border-ytBorder rounded p-4">
                  {product.brandStyle}
                </pre>
              ) : (
                <textarea
                  value={editedStyle}
                  onChange={e => setEditedStyle(e.target.value)}
                  className="flex-1 bg-ytBackground border border-ytBorder focus:border-ytRed outline-none rounded text-sm p-4 font-mono leading-relaxed text-white resize-none"
                  placeholder="Refine brand styling requirements..."
                />
              )}
            </div>
          )}
        </div>
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
          className="bg-ytRed hover:bg-ytRed/90 text-white font-medium rounded text-sm px-6 min-h-[44px] transition-colors shadow-md"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
