import { h } from 'preact';
import * as Tone from 'tone';
import useTrack from './useTrack';
import useProgress from './useProgress';

async function start() {
  await Tone.start();
}

export default function App() {
  const { track, error, beats, lastUpdateTime, tempo } = useTrack();
  const { progress, beatIndex } = useProgress({ track, beats, lastUpdateTime });

  if(error) {
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
        <h4>{tempo}</h4>
        <h1
          style={{
            fontSize: '400px',
            margin: 0,
          }}
        >{beatIndex}</h1>
      </div>
    )
  }
}