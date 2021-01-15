import { h } from 'preact';
import BottomBar from './BottomBar';
import * as Tone from 'tone';
import { useState } from 'preact/hooks';
import { SharedStateProvider } from './useSharedState';
import GifEditor from './GifEditor';
import Gallery from './Gallery';

export default function App() {
  const [editingGifUrl, setEditingGifUrl] = useState(undefined);
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
          {!editingGifUrl && (
            <Gallery onSelect={setEditingGifUrl}/>
          )}
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