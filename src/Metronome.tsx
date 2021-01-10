import { h } from 'preact';
import { useEffect, useState, useRef } from 'preact/hooks';
import * as Tone from 'tone';
import * as Timer from './utils/timer';
import GifPlayer from './GifPlayer';
import GifTimeline from './GifTimeline';
import useSharedState from './useSharedState';

export default function Metronome() {
  const [highlight, setHighlight] = useState(false);
  const { bpm, setBpm } = useSharedState();
  
  useEffect(() => {
    const tick = () => setHighlight(true);
    Timer.addToneListener(tick);
    return () => Timer.removeListener(tick);
  }, []);
  
  useEffect(() => {
    Timer.setToneBpm(bpm);
  }, [bpm])
  
  useEffect(() => {
    if(highlight) setHighlight(false);
  }, [highlight]);
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
    }}>
      <h1
        style={{
          margin: '32px auto',
          width: 'fit-content',
          transform: highlight ? 'scale(2)': 'scale(1)',
          transition: !highlight && 'transform 0.3s',
          transitionOrigin: '50% 50%',
        }}
      >{bpm}</h1>
      <input
        type='range'
        value={bpm}
        min={1}
        max={400}
        oninput={({ target: { value }}) => setBpm(value)}
      />
    </div>
  )
}