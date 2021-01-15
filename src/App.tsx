import { h } from 'preact';
import BottomBar from './BottomBar';
import * as Tone from 'tone';
import { useState } from 'preact/hooks';
import GifTimeline from './GifTimeline';
import { SharedStateProvider } from './useSharedState';
import GifEditor from './GifEditor';

export default function App() {
  const [editingGifUrl, setEditingGifUrl] = useState('https://media.giphy.com/media/6mr2y6RGPcEU0/giphy.gif');
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
          {/* {!editingGifUrl && (
            
          )} */}
          {editingGifUrl && (
            <GifEditor
              url={editingGifUrl}
              onClose={() => setEditingGifUrl(undefined)}
            />
          )}
          <BottomBar/>
        </div>
      )}
    </SharedStateProvider>
  )
}