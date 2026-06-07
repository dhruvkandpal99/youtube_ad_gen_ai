'use client';

import React, { useState, useRef } from 'react';
import { useAppState } from '../providers/AppStateProvider';
import { examples } from '@/data/examples';
import { parseDoc } from '@/lib/parseDoc';
import { Product } from '@/types';

export default function ProductSelection() {
  const { state, dispatch } = useAppState();
  const [selectedId, setSelectedId] = useState<string | null>(state.product?.id || null);
  const [isCustom, setIsCustom] = useState<boolean>(state.product ? !state.product.isExample : false);

  // Custom product inputs
  const [customName, setCustomName] = useState(state.product && !state.product.isExample ? state.product.name : '');
  const [customTagline, setCustomTagline] = useState(state.product && !state.product.isExample ? state.product.tagline : '');
  const [customImage, setCustomImage] = useState(state.product && !state.product.isExample ? state.product.assetUrl : '');
  const [customInfo, setCustomInfo] = useState(state.product && !state.product.isExample ? state.product.productInfo : '');
  const [customStyle, setCustomStyle] = useState(state.product && !state.product.isExample ? state.product.brandStyle : '');

  // File parsing states
  const [infoParsing, setInfoParsing] = useState(false);
  const [styleParsing, setStyleParsing] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const infoInputRef = useRef<HTMLInputElement>(null);
  const styleInputRef = useRef<HTMLInputElement>(null);

  const handleSelectExample = (prod: Product) => {
    setSelectedId(prod.id);
    setIsCustom(false);
  };

  const handleSelectCustom = () => {
    setSelectedId('custom');
    setIsCustom(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'info' | 'style') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (target === 'info') {
      setInfoParsing(true);
      try {
        const text = await parseDoc(file);
        setCustomInfo(text);
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Error parsing file';
        alert(errMsg);
      } finally {
        setInfoParsing(false);
      }
    } else {
      setStyleParsing(true);
      try {
        const text = await parseDoc(file);
        setCustomStyle(text);
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Error parsing file';
        alert(errMsg);
      } finally {
        setStyleParsing(false);
      }
    }
  };

  const handleContinue = () => {
    let finalProduct: Product;
    if (isCustom) {
      // For custom products, create a simple keyword-based embeddingText fallback
      const keywords = `${customName}, ${customTagline}, ${customInfo.slice(0, 100)}, ${customStyle.slice(0, 100)}`;
      finalProduct = {
        id: 'custom-product',
        name: customName,
        tagline: customTagline,
        isExample: false,
        assetUrl: customImage,
        productInfo: customInfo,
        brandStyle: customStyle,
        embeddingText: keywords,
      };
    } else {
      finalProduct = examples.find(e => e.id === selectedId)!;
    }

    dispatch({ type: 'SET_PRODUCT', payload: finalProduct });
    dispatch({ type: 'SET_STEP', payload: 2 });
  };

  const isFormValid = !isCustom 
    ? selectedId !== null 
    : (customName.trim() !== '' && 
       customTagline.trim() !== '' && 
       customImage !== '' && 
       customInfo.trim() !== '' && 
       customStyle.trim() !== '');

  return (
    <div className="flex-1 flex flex-col justify-between max-w-4xl mx-auto w-full py-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Select Product Asset</h1>
          <p className="text-ytTextSecondary text-sm mt-1">Choose a demo campaign or configure custom guidelines for your own product.</p>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {examples.map(prod => {
            const isSelected = selectedId === prod.id && !isCustom;
            return (
              <div
                key={prod.id}
                onClick={() => handleSelectExample(prod)}
                className={`bg-ytSurface rounded border-2 p-5 cursor-pointer flex flex-col justify-between h-[220px] transition-all relative ${
                  isSelected ? 'border-ytRed bg-ytSurface/80' : 'border-ytBorder hover:border-[#5c5c5c]'
                }`}
              >
                <div className="absolute top-3 right-3 bg-ytRed text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded tracking-wide">
                  Example
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white leading-snug">{prod.name}</h3>
                  <p className="text-ytTextSecondary text-xs italic line-clamp-2">{"\""}{prod.tagline}{"\""}</p>
                </div>
                <div className="w-full h-20 relative rounded overflow-hidden mt-4">
                  <img src={prod.assetUrl} alt={prod.name} className="w-full h-full object-cover" />
                </div>
              </div>
            );
          })}

          {/* Custom Upload Card */}
          <div
            onClick={handleSelectCustom}
            className={`bg-ytSurface rounded border-2 p-5 cursor-pointer flex flex-col justify-center items-center h-[220px] text-center transition-all ${
              isCustom ? 'border-ytRed bg-ytSurface/80' : 'border-ytBorder hover:border-[#5c5c5c]'
            }`}
          >
            <div className="w-12 h-12 rounded-full border border-dashed border-ytTextSecondary flex items-center justify-center text-ytTextSecondary mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-white">Upload Your Own</h3>
            <p className="text-ytTextSecondary text-xs mt-1 max-w-[180px]">Provide assets, copy, and brand voice guidelines</p>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="md:col-span-2 text-xs text-[#888888] leading-relaxed">
            Premade examples show pregenerated ads by default. Add an API key to regenerate.
          </div>
          <div className="text-xs text-[#888888] leading-relaxed">
            Requires API key for generation.
          </div>
        </div>

        {/* Custom Fields Inline */}
        {isCustom && (
          <div className="mt-8 bg-ytSurface border border-ytBorder rounded p-6 space-y-6">
            <h2 className="text-lg font-semibold text-white">Configure Custom Product</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* Product Name */}
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-ytTextSecondary uppercase tracking-wider mb-1.5">Product Name</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={e => setCustomName(e.target.value)}
                    placeholder="e.g. Solis Smart Water Bottle"
                    className="bg-ytBackground border border-ytBorder focus:border-ytRed outline-none rounded text-white text-sm px-4 py-2.5 transition-colors h-11"
                  />
                </div>

                {/* Tagline */}
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-ytTextSecondary uppercase tracking-wider mb-1.5">Tagline</label>
                  <input
                    type="text"
                    value={customTagline}
                    onChange={e => setCustomTagline(e.target.value)}
                    placeholder="e.g. Hydration tracked. Health refined."
                    className="bg-ytBackground border border-ytBorder focus:border-ytRed outline-none rounded text-white text-sm px-4 py-2.5 transition-colors h-11"
                  />
                </div>

                {/* Image Upload */}
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-ytTextSecondary uppercase tracking-wider mb-1.5">Product Image</label>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => imageInputRef.current?.click()}
                      className="bg-ytBackground hover:bg-[#1f1f1f] text-white border border-ytBorder px-4 py-2 rounded text-xs font-medium min-h-[44px] transition-colors"
                    >
                      Choose Image
                    </button>
                    <input
                      type="file"
                      ref={imageInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    {customImage && (
                      <div className="w-14 h-14 relative rounded overflow-hidden border border-ytBorder">
                        <img src={customImage} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Text Areas */}
              <div className="space-y-4">
                {/* Product Info */}
                <div className="flex flex-col">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-ytTextSecondary uppercase tracking-wider">Product Info</label>
                    <div className="flex items-center">
                      <input
                        type="file"
                        ref={infoInputRef}
                        onChange={e => handleDocUpload(e, 'info')}
                        accept=".txt,.md,.pdf"
                        className="hidden"
                      />
                      <button
                        onClick={() => infoInputRef.current?.click()}
                        disabled={infoParsing}
                        className="text-ytRed hover:underline text-xs"
                      >
                        {infoParsing ? 'Parsing...' : 'Upload Doc (.txt, .md, .pdf)'}
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={customInfo}
                    onChange={e => setCustomInfo(e.target.value)}
                    placeholder="Paste full product descriptions, specs, or materials here..."
                    className="bg-ytBackground border border-ytBorder focus:border-ytRed outline-none rounded text-white text-sm p-4 h-[120px] resize-none transition-colors"
                  />
                </div>

                {/* Brand Style */}
                <div className="flex flex-col">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-ytTextSecondary uppercase tracking-wider">Brand Style Guide</label>
                    <div className="flex items-center">
                      <input
                        type="file"
                        ref={styleInputRef}
                        onChange={e => handleDocUpload(e, 'style')}
                        accept=".txt,.md,.pdf"
                        className="hidden"
                      />
                      <button
                        onClick={() => styleInputRef.current?.click()}
                        disabled={styleParsing}
                        className="text-ytRed hover:underline text-xs"
                      >
                        {styleParsing ? 'Parsing...' : 'Upload Doc (.txt, .md, .pdf)'}
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={customStyle}
                    onChange={e => setCustomStyle(e.target.value)}
                    placeholder="Paste visual identity guidelines, logo requirements, colors, tone, or style limits here..."
                    className="bg-ytBackground border border-ytBorder focus:border-ytRed outline-none rounded text-white text-sm p-4 h-[120px] resize-none transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="border-t border-ytBorder mt-8 pt-4 flex justify-end">
        <button
          onClick={handleContinue}
          disabled={!isFormValid}
          className="bg-ytRed hover:bg-ytRed/90 disabled:bg-[#3f3f3f] disabled:text-[#888888] text-white font-medium rounded text-sm px-6 min-h-[44px] transition-colors flex items-center justify-center shadow-md disabled:shadow-none"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
