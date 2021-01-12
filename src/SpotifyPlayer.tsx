import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import * as Tone from 'tone';
import * as Spotify from './utils/spotify';

async function start() {
  await Tone.start();
}

function useListen() {
  const [track, setTrack] = useState({});
  const [progress, onProgress] = useState(0);
  const [beat, onBeat] = useState(undefined);
  const [error, onError] = useState({})
  
  useEffect(() => {
    const listener = {
      onTrackUpdate: track => {
        setTrack(track);
        onError({});
      },
      onProgress,
      onBeat,
      onError,
    };
    Spotify.addListener(listener);
    return () => Spotify.removeListener(listener);
  }, []);
  
  return { ...track, ...beat, progress, error };
}

export default function SpotifyPlayer() {
  const { track, error, progress } = useListen();
  
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
      </div>
    )
  }
}