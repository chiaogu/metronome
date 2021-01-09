import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import * as Tone from 'tone';
import listen from './utils/listen';

async function start() {
  await Tone.start();
}

function useListen() {
  const [track, onTrackChange] = useState({});
  const [progress, onProgress] = useState(0);
  const [beat, onBeat] = useState(undefined);
  const [error, onError] = useState({})
  
  useEffect(() => {
    const stopListening = listen({
      onTrackChange,
      onProgress,
      onBeat,
      onError,
    });
    return stopListening;
  }, []);
  
  return { ...track, ...beat, progress, error };
}

export default function SpotifyPlayer() {
  const { track, error, tempo, progress, beatIndex, bpm } = useListen();
  const [highlight, setHighlight] = useState(false);
  
  useEffect(() => {
    setHighlight(true);
    const timeoutId = setTimeout(setHighlight, 200);
    return () => clearTimeout(timeoutId);
  }, [beatIndex])
  
  if(error?.message) {
    return (
      <div>{error.message}</div>
    );
  }
  
  if(track) {
    return (
      <div
        onClick={start}
      >
        <img
          style={{
            width: '200px',
            height: '200px',
          }}
          src={track.albumCoverUrl}
        />
        <h1>{track.name}</h1>
        <h2>{track.albumName}</h2>
        <div
          style={{
            position: 'relative',
            height: '20px',
            width: '1000px',
          }}
        >
          <div 
            style={{
              width: '100%',
              height: '10px',
              border: '1px solid black'
            }}
          >
            <div 
              style={{
                width: '100%',
                height: '100%',
                background: 'black',
                transformOrigin: '0 50%',
                transform: `scaleX(${progress / track.duration})`
              }}
            ></div>
          </div>
        </div>
        <h4>{tempo} / {bpm}</h4>
        <h1
          style={{
            width: 'fit-content',
            fontSize: '400px',
            margin: 0,
            transform: highlight ? 'scale(1)': 'scale(0.9)',
            transition: !highlight && 'transform 0.3s',
            transitionOrigin: '50% 50%',
          }}
        >{beatIndex}</h1>
      </div>
    )
  }
}