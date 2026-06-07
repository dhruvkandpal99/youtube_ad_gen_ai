'use client';

import React from 'react';

type ClusterTooltipProps = {
  active?: boolean;
  payload?: {
    payload: {
      clusterLabel: string;
      isMatched: boolean;
      similarity: number;
      name: string;
      subredditsInCluster: string[];
    };
  }[];
};

export default function ClusterTooltip({ active, payload }: ClusterTooltipProps) {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    return (
      <div className="bg-ytSurface border border-ytBorder p-3 rounded shadow-lg max-w-[240px] text-xs space-y-1.5 select-none z-50">
        <div className="flex justify-between items-center border-b border-ytBorder pb-1">
          <span className="font-semibold text-white truncate mr-2">{dataPoint.clusterLabel}</span>
          <span className={`font-medium ${dataPoint.isMatched ? 'text-ytRed' : 'text-ytTextSecondary'}`}>
            {Math.round(dataPoint.similarity * 100)}% Match
          </span>
        </div>
        <div>
          <span className="text-[#888888]">Subreddit: </span>
          <span className="text-white font-mono">r/{dataPoint.name}</span>
        </div>
        <div>
          <div className="text-[#888888] mb-0.5">Top communities in cluster:</div>
          <div className="flex flex-wrap gap-1">
            {dataPoint.subredditsInCluster.slice(0, 3).map((name: string) => (
              <span key={name} className="bg-ytBackground text-white px-1.5 py-0.5 rounded text-[10px] border border-ytBorder font-mono">
                r/{name}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return null;
}
