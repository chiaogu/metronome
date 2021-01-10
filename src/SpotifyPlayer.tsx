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
  const { track, error, progress, beatIndex, bpm = 0 } = useListen();
  const [highlight, setHighlight] = useState(false);
  
  useEffect(() => {
    setHighlight(true);
  }, [beatIndex])
  
  useEffect(() => {
    if(highlight) requestAnimationFrame(() => setHighlight(false));
  }, [highlight])
  
  if(error?.message) {
    return (
      <div>{error.message}</div>
    );
  }
  
  if(track) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
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
            width: '300px',
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
                transform: `scaleX(${Math.min(1, progress / track.duration)})`
              }}
            ></div>
          </div>
        </div>
        <h1
          style={{
            width: 'fit-content',
            fontSize: '100px',
            transform: highlight ? 'scale(1.5)': 'scale(1)',
            transition: !highlight && `transform ${1000 * 60 / bpm}ms`,
            transitionOrigin: '50% 50%',
          }}
        >{Math.round(bpm)}</h1>
      </div>
    )
  }
}