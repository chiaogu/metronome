import { h } from 'preact';
import BottomBar from './BottomBar';
import * as Tone from 'tone';
import { useState } from 'preact/hooks';
import GifTimeline from './GifTimeline';
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
      {isStarted && (
        <div>
          <BottomBar/>
          <GifTimeline url='https://media.giphy.com/media/6mr2y6RGPcEU0/giphy.gif'/>
        </div>
      )}
    </SharedStateProvider>
  )
}