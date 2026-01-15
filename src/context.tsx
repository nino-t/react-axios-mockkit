import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { LogItem, MockRule, MockKitState } from './types';

type Action =
  | { type: 'ADD_LOG'; payload: LogItem }
  | { type: 'UPDATE_LOG'; payload: Partial<LogItem> & { id: string } }
  | { type: 'ADD_RULE'; payload: MockRule }
  | { type: 'UPDATE_RULE'; payload: MockRule }
  | { type: 'TOGGLE_RULE'; payload: string }
  | { type: 'DELETE_RULE'; payload: string }
  | { type: 'TOGGLE_OPEN' }
  | { type: 'CLEAR_LOGS' };

const initialState: MockKitState = {
  logs: [],
  rules: [],
  isOpen: false,
};

const MockKitContext = createContext<{
  state: MockKitState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

function reducer(state: MockKitState, action: Action): MockKitState {
  switch (action.type) {
    case 'ADD_LOG':
      return { ...state, logs: [action.payload, ...state.logs].slice(0, 100) }; // Keep last 100
    case 'UPDATE_LOG':
        return {
            ...state,
            logs: state.logs.map(log => log.id === action.payload.id ? { ...log, ...action.payload } : log)
        };
    case 'ADD_RULE':
      return { ...state, rules: [...state.rules, action.payload] };
    case 'UPDATE_RULE':
      return {
        ...state,
        rules: state.rules.map((r) => (r.id === action.payload.id ? action.payload : r)),
      };
    case 'TOGGLE_RULE':
      return {
        ...state,
        rules: state.rules.map((r) => (r.id === action.payload ? { ...r, enabled: !r.enabled } : r)),
      };
    case 'DELETE_RULE':
      return { ...state, rules: state.rules.filter((r) => r.id !== action.payload) };
    case 'TOGGLE_OPEN':
      return { ...state, isOpen: !state.isOpen };
    case 'CLEAR_LOGS':
      return { ...state, logs: [] };
    default:
      return state;
  }
}

export const MockKitProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <MockKitContext.Provider value={{ state, dispatch }}>
      {children}
    </MockKitContext.Provider>
  );
};

export const useMockKit = () => {
  const context = useContext(MockKitContext);
  if (!context) {
    throw new Error('useMockKit must be used within a MockKitProvider');
  }
  return context;
};
