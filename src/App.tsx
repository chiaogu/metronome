import { h } from 'preact';
import SpotifyPlayer from './SpotifyPlayer';
import Metronome from './Metronome';
import * as Tone from 'tone';
import { useState } from 'preact/hooks';
import GifTimeline from './GifTimeline';
import GifPlayer from './GifPlayer';

export default function App() {
  const [isStarted, setStarted] = useState(false);
  
  async function start(){
    if(isStarted) return;
    await Tone.start();
    setStarted(true);
  }
  
  return (
    <div>
      {!isStarted && <button onClick={start}>Start</button>}
      {isStarted && (
        <div
          style={{
            display: 'flex',
            height: '100%',
          }}
        >
          <Metronome/>
          <GifTimeline/>
          <GifPlayer/>
        </div>
      )}
    </div>
  )
}