'use client';

import React, { useState } from 'react';
import { PromptConcept } from '@/types';

type PromptCardProps = {
  concept: PromptConcept;
  onApprove: (id: string) => void;
  onDiscard: (id: string) => void;
  onUpdate: (id: string, newPromptText: string) => void;
};

export default function PromptCard({ concept, onApprove, onDiscard, onUpdate }: PromptCardProps) {
  const [isEditing, setIsEditing] = useState(concept.edited);
  const [editText, setEditText] = useState(concept.prompt);

  const handleToggleEdit = () => {
    if (isEditing) {
      // Save changes on toggle off
      onUpdate(concept.id, editText);
    }
    setIsEditing(!isEditing);
  };

  // Helper to parse sections (Scene, Subject, Segment, etc.)
  const parseSections = (text: string) => {
    const sections = ['Scene', 'Subject', 'Segment', 'Tone', 'Colors', 'Avoid', 'Brand constraints'];
    const lines = text.split('\n');
    const result: { label: string; content: string }[] = [];

    let currentSection = '';
    let currentContent = '';

    lines.forEach(line => {
      const matchedSection = sections.find(s => line.trim().toLowerCase().startsWith(s.toLowerCase() + ':'));
      
      if (matchedSection) {
        if (currentSection) {
          result.push({ label: currentSection, content: currentContent.trim() });
        }
        currentSection = matchedSection;
        currentContent = line.substring(matchedSection.length + 1).trim();
      } else {
        if (currentSection) {
          currentContent += '\n' + line;
        } else {
          currentContent += (currentContent ? '\n' : '') + line;
        }
      }
    });

    if (currentSection) {
      result.push({ label: currentSection, content: currentContent.trim() });
    } else if (currentContent) {
      result.push({ label: 'Brief Details', content: currentContent.trim() });
    }

    return result;
  };

  const sections = parseSections(concept.prompt);

  return (
    <div
      className={`bg-ytSurface rounded border transition-all duration-200 ${
        concept.approved
          ? 'border-l-4 border-l-ytGreen border-ytBorder pl-4'
          : 'border-ytBorder pl-5'
      } pr-5 py-5 space-y-4`}
    >
      {/* Top Header Row */}
      <div className="flex justify-between items-start">
        <div>
          <span className="font-semibold text-white text-base">{concept.cluster.label} Target</span>
          <div className="text-[11px] text-[#888888] font-mono mt-0.5">
            Cosine Similarity: {Math.round(concept.cluster.similarity * 100)}%
          </div>
        </div>

        {/* Edit toggle */}
        <button
          onClick={handleToggleEdit}
          className="text-xs text-ytTextSecondary hover:text-white border border-ytBorder px-3 py-1 rounded min-h-[32px] transition-colors"
        >
          {isEditing ? 'Save Brief' : 'Edit Brief'}
        </button>
      </div>

      {/* Structured Prompt Block */}
      <div className="bg-ytBackground border border-ytBorder rounded p-4 space-y-3 font-sans">
        {isEditing ? (
          <textarea
            value={editText}
            onChange={e => setEditText(e.target.value)}
            className="w-full h-[220px] bg-transparent outline-none border-0 text-white text-xs font-mono resize-none leading-relaxed"
          />
        ) : (
          <div className="space-y-2">
            {sections.map(sec => (
              <div key={sec.label} className="text-xs leading-relaxed">
                <span className="text-[#888888] font-semibold">{sec.label}: </span>
                <span className="text-white whitespace-pre-wrap">{sec.content}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons Row */}
      <div className="flex justify-end space-x-3 items-center pt-2">
        <button
          onClick={() => onDiscard(concept.id)}
          className="text-xs font-medium text-ytTextSecondary hover:text-ytRed border border-transparent hover:border-ytRed px-4 py-2 rounded min-h-[38px] transition-colors"
        >
          Discard
        </button>
        <button
          onClick={() => onApprove(concept.id)}
          className={`text-xs font-medium px-5 py-2 rounded min-h-[38px] transition-colors flex items-center space-x-1.5 ${
            concept.approved
              ? 'bg-ytGreen/15 border border-ytGreen text-ytGreen hover:bg-ytGreen/25'
              : 'bg-ytRed hover:bg-ytRed/90 text-white'
          }`}
        >
          <span>{concept.approved ? 'Approved ✓' : 'Approve ✓'}</span>
        </button>
      </div>
    </div>
  );
}
