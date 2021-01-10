import { h, createContext } from 'preact';
import { useContext, useState } from 'preact/hooks';

const StateContext = createContext({
  bpm: undefined,
  setBpm: undefined,
});

export function SharedStateProvider({ children }: { children?: any }) {
  const [bpm, setBpm] = useState(60);
  
  const sharedState = {
    bpm,
    setBpm,
  };
  
  return (
    <StateContext.Provider value={sharedState}>
      {children}
    </StateContext.Provider>
  )
}

export default function useSharedState() {
  return useContext(StateContext);
}