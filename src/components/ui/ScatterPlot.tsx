'use client';

import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Subreddit, Cluster } from '@/types';
import ClusterTooltip from './ClusterTooltip';

type Point = {
  x: number;
  y: number;
  name: string;
  clusterLabel: string;
  isMatched: boolean;
  similarity: number;
  subredditsInCluster: string[];
};

type ScatterPlotProps = {
  subreddits: Subreddit[];
  clusters: Cluster[];
  onPointSelect?: (point: Point | null) => void;
};

export default function ScatterPlot({ subreddits, clusters, onPointSelect }: ScatterPlotProps) {
  // Map our subreddits to scatter plot points using UMAP 2D coordinates
  const data: Point[] = subreddits.map(sub => {
    // Find the cluster this subreddit belongs to
    const cluster = clusters.find(c => c.subreddits.some(s => s.name === sub.name));
    return {
      x: cluster?.point2d ? cluster.point2d[0] + (Math.random() - 0.5) * 0.15 : 0, // add tiny jitter for readability
      y: cluster?.point2d ? cluster.point2d[1] + (Math.random() - 0.5) * 0.15 : 0,
      name: sub.name,
      clusterLabel: cluster?.label || 'Unknown',
      isMatched: cluster?.isMatched || false,
      similarity: cluster?.similarity || 0,
      subredditsInCluster: cluster?.subreddits.map(s => s.name) || [],
    };
  });

  const handlePointClick = (point: unknown) => {
    if (onPointSelect) {
      const p = point as { payload?: Point };
      if (p?.payload) {
        onPointSelect(p.payload);
      }
    }
  };

  return (
    <div className="w-full aspect-square md:aspect-[4/3] bg-ytBackground border border-ytBorder rounded p-4 relative flex flex-col justify-between">
      {/* Title / legend overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-col space-y-1 bg-ytBackground/80 backdrop-blur-sm p-2 rounded">
        <span className="text-xs font-semibold text-white uppercase tracking-wider">Interest Space Alignment</span>
        <div className="flex items-center space-x-4 text-[10px]">
          <div className="flex items-center space-x-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-ytRed shadow-[0_0_6px_rgba(255,0,0,0.6)]" />
            <span className="text-white">Matched Segments</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#5c5c5c]" />
            <span className="text-ytTextSecondary">Other Communities</span>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full h-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            {/* Invisible axes to support rendering, but hidden for high-tech aesthetic */}
            <XAxis type="number" dataKey="x" name="x" hide domain={['auto', 'auto']} />
            <YAxis type="number" dataKey="y" name="y" hide domain={['auto', 'auto']} />
            <ZAxis type="number" range={[100, 100]} />
            <Tooltip content={<ClusterTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#3f3f3f' }} />
            <Scatter
              name="Communities"
              data={data}
              onClick={handlePointClick}
              className="cursor-pointer"
            >
              {data.map((point, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={point.isMatched ? '#ff0000' : '#5c5c5c'}
                  className="transition-all duration-200 hover:scale-125 hover:stroke-white hover:stroke-[1.5]"
                  style={{
                    filter: point.isMatched ? 'drop-shadow(0 0 4px rgba(255,0,0,0.6))' : 'none',
                  }}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
