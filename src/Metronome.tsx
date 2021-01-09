import { h } from 'preact';
import { useEffect, useState, useRef } from 'preact/hooks';
import * as Tone from 'tone';
import * as Timer from './utils/timer';
import GifPlayer from './GifPlayer';

function startMetronome(bpm) {
  let lastTick = 0;
  
  function tick(time) {
    if(time - lastTick >= 60 / bpm * 1000) {
      console.log(time - lastTick, 60 / bpm * 1000);
      lastTick = time;
    }
  }
  Timer.addListener(tick);
  return () => Timer.removeListener(tick);
}

export default function Metronome() {
  const [highlight, setHighlight] = useState(false);
  const [bpm, setBpm] = useState(60);
  
  useEffect(() => {
    setTimeout(() => setBpm(120), 3000);
    setTimeout(() => setBpm(240), 6000);
  }, []);
  
  useEffect(() => {
    const stop = startMetronome(bpm);
    return () => stop();
  }, [bpm])
  
  return <GifPlayer/>
}