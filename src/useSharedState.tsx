import { h, createContext } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';
import { GIF_META } from './constants';
import * as Spotify from './utils/spotify';
import * as Timer from './utils/timer';

const StateContext = createContext({
  bpm: undefined,
  setBpm: undefined,
  isSpotify: undefined,
  setSpotify: undefined,
  meta: undefined,
  setMeta: undefined,
});

export function SharedStateProvider({ children }: { children?: any }) {
  const [bpm, setBpm] = useState(60);
  const [isSpotify, setSpotify] = useState(true);
  const [meta, setMeta] = useState(GIF_META);
  
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
    meta,
    setMeta: (url, newMeta) => setMeta({
      ...meta,
      [url]: {
        ...meta[url],
        ...newMeta
      }
    }), 
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