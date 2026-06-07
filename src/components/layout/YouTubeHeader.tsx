'use client';

import React from 'react';
import { useAppState } from '../providers/AppStateProvider';

export default function YouTubeHeader() {
  const { dispatch } = useAppState();

  const handleLogoClick = () => {
    dispatch({ type: 'SET_STEP', payload: 1 });
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-[56px] bg-ytSurface border-b border-ytBorder flex items-center justify-between px-6 z-50">
      <div className="flex items-center space-x-2">
        {/* YouTube Play Icon & Wordmark Logo */}
        <div onClick={handleLogoClick} className="flex items-center space-x-1.5 cursor-pointer">
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-ytRed" xmlns="http://www.w3.org/2000/svg">
            <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.507 9.388.507 9.388.507s7.517 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837z" />
            <polygon points="9.545 15.568 15.818 12 9.545 8.432" className="fill-white" />
          </svg>
          <span className="font-bold text-[19px] tracking-tighter text-white font-sans select-none flex items-center">
            YouTube
          </span>
          {/* Divider & Sub-branding */}
          <div className="h-5 w-[1px] bg-ytBorder mx-2.5"></div>
          <span className="text-[17px] font-normal text-ytTextSecondary tracking-tight">
            Advertising
          </span>
        </div>
      </div>

      {/* User Avatar */}
      <div>
        <div className="w-8 h-8 rounded-full bg-[#5c5c5c] flex items-center justify-center text-white font-semibold text-sm select-none border border-ytBorder">
          Y
        </div>
      </div>
    </header>
  );
}
