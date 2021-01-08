import { useEffect, useRef, useState } from 'preact/hooks';
import * as Timer from './timer';
import * as Tone from 'tone';
const synth = new Tone.MembraneSynth({ volume: 0 }).toDestination();

export default function useProgress({ track, beats, lastUpdateTime }) {
  const [progress, setProgress] = useState(0);
  const prevBeatIndex = useRef(0);
  const [beatIndex, setBeatIndex] = useState(0);
  
  useEffect(() => {
    const updateProgress = time => {
      const currentProgress = track.progress + (time - lastUpdateTime);
      setProgress(currentProgress);
      let nextBeatIndex = prevBeatIndex.current;
      while(beats[nextBeatIndex] * 1000 - currentProgress < 30) {
        nextBeatIndex++;
      }
      if(prevBeatIndex.current !== nextBeatIndex) {
        if(prevBeatIndex.current !== 0) {
          // synth.triggerAttackRelease('C3', '16n');
          setBeatIndex(nextBeatIndex);
        }
        prevBeatIndex.current = nextBeatIndex;
      }
    };
    if(track?.isPlaying) Timer.start(updateProgress);
    return () => {
      Timer.stop();
      prevBeatIndex.current = 0;
    }
  }, [track?.isPlaying, track?.progress, beats, lastUpdateTime]);

  return { progress, beatIndex };
}