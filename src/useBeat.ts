import { useCallback, useEffect, useState } from 'preact/hooks';
import * as Timer from './utils/timer';
import useSharedState from './useSharedState';
import * as Spotify from './utils/spotify';

export default function useBeat(onBeat?) {
  const [isOnBeat, setOnBeat] = useState(false);
  const { isSpotify } = useSharedState();
  
  useEffect(() => {
    if(!isSpotify) {
      const tick = () => {
        if(onBeat) onBeat();
        setOnBeat(true);
      }
      Timer.addToneListener(tick);
      return () => Timer.removeToneListener(tick);
    } else {
      const listener = {
        onBeat: () => {
          if(onBeat) onBeat();
          setOnBeat(true);
        }
      };
      Spotify.addListener(listener);
      return () => Spotify.removeListener(listener);
    }
  }, [isSpotify, onBeat]);

  useEffect(() => {
    if(isOnBeat) setOnBeat(false);
  }, [isOnBeat]);
  
  return isOnBeat;
}