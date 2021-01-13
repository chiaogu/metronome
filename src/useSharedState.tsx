import { h, createContext } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';
import * as Spotify from './utils/spotify';
import * as Timer from './utils/timer';

const StateContext = createContext({
  bpm: undefined,
  setBpm: undefined,
  isSpotify: undefined,
  setSpotify: undefined,
});

export function SharedStateProvider({ children }: { children?: any }) {
  const [bpm, setBpm] = useState(60);
  const [isSpotify, setSpotify] = useState(true);
  
  useEffect(() => {
    Timer.setToneBpm(bpm);
  }, []);
  
  useEffect(() => {
    if(isSpotify) {
      const listener = {
        onBeat: ({ bpm }) => setBpm(Math.round(bpm)),
      };
      Spotify.addListener(listener);
      return () => Spotify.removeListener(listener);
    }
  }, [isSpotify])
  
  const sharedState = {
    bpm,
    setBpm,
    isSpotify,
    setSpotify,
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