'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, Product, APIKeys, Subreddit, Cluster, PromptConcept, AdConcept } from '../../types';

type Action =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_PRODUCT'; payload: Product | null }
  | { type: 'SET_API_KEYS'; payload: APIKeys | null }
  | { type: 'SET_SUBREDDITS'; payload: Subreddit[] }
  | { type: 'SET_CLUSTERS'; payload: Cluster[] }
  | { type: 'SET_MATCHED_CLUSTERS'; payload: Cluster[] }
  | { type: 'SET_PROMPT_CONCEPTS'; payload: PromptConcept[] }
  | { type: 'SET_AD_CONCEPTS'; payload: AdConcept[] }
  | { type: 'SET_DEMO'; payload: boolean }
  | { type: 'RESET_STATE' };

const initialState: AppState = {
  step: 1,
  product: null,
  apiKeys: null,
  subreddits: [],
  clusters: [],
  matchedClusters: [],
  promptConcepts: [],
  adConcepts: [],
  isDemo: true,
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'SET_PRODUCT':
      return {
        ...state,
        product: action.payload,
        // Reset subsequent states when the product changes
        clusters: [],
        matchedClusters: [],
        promptConcepts: [],
        adConcepts: [],
      };
    case 'SET_API_KEYS':
      return { ...state, apiKeys: action.payload };
    case 'SET_SUBREDDITS':
      return { ...state, subreddits: action.payload };
    case 'SET_CLUSTERS':
      return { ...state, clusters: action.payload };
    case 'SET_MATCHED_CLUSTERS':
      return { ...state, matchedClusters: action.payload };
    case 'SET_PROMPT_CONCEPTS':
      return { ...state, promptConcepts: action.payload };
    case 'SET_AD_CONCEPTS':
      return { ...state, adConcepts: action.payload };
    case 'SET_DEMO':
      return { ...state, isDemo: action.payload };
    case 'RESET_STATE':
      return { ...initialState };
    default:
      return state;
  }
}

const AppStateContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
