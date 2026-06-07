'use client';

import { useAppState } from '@/components/providers/AppStateProvider';
import ProductSelection from '@/components/steps/ProductSelection';
import AssetReview from '@/components/steps/AssetReview';
import APIKeyEntry from '@/components/steps/APIKeyEntry';
import SegmentDiscovery from '@/components/steps/SegmentDiscovery';
import PromptReview from '@/components/steps/PromptReview';
import AdGeneration from '@/components/steps/AdGeneration';
import CampaignSummary from '@/components/steps/CampaignSummary';

export default function Home() {
  const { state } = useAppState();

  const renderStep = () => {
    switch (state.step) {
      case 1:
        return <ProductSelection />;
      case 2:
        return <AssetReview />;
      case 3:
        return <APIKeyEntry />;
      case 4:
        return <SegmentDiscovery />;
      case 5:
        return <PromptReview />;
      case 6:
        return <AdGeneration />;
      case 7:
        return <CampaignSummary />;
      default:
        return <ProductSelection />;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-ytBackground px-4 md:px-8 py-6 max-w-7xl mx-auto w-full">
      {renderStep()}
    </div>
  );
}
