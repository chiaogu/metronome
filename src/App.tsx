import { h } from 'preact';
import SpotifyPlayer from './SpotifyPlayer';
import Metronome from './Metronome';
import * as Tone from 'tone';
import { useState } from 'preact/hooks';
import GifTimeline from './GifTimeline';
import GifPlayer from './GifPlayer';
import { SharedStateProvider } from './useSharedState';

export default function App() {
  const [isStarted, setStarted] = useState(false);
  
  async function start(){
    if(isStarted) return;
    await Tone.start();
    setStarted(true);
  }
  
  return (
    <SharedStateProvider>
      {!isStarted && <button onClick={start}>Start</button>}
      {!isStarted && (
        <div>
          <Metronome/>
          <GifTimeline/>
        </div>
      )}
    </SharedStateProvider>
  )
}