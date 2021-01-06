import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { getTrackAnalysis, Track } from './spotifyApi';
import useSpotifyPlayer from './useSpotifyPlayer';
import * as Timer from './timer';
import * as Tone from 'tone';
import { Time } from 'tone';
const synth = new Tone.MembraneSynth({ volume: 0 }).toDestination();

function useTrack(): {
  track: Track;
  error: Error;
  beats: number[];
  lastUpdateTime: number;
  tempo: number;
} {
  const [track, setTrack] = useState<Track>(null);
  const [error, setError] = useState<Error>(null);
  const [beats, setBeats] = useState<number[]>([]);
  const [tempo, setTempo] = useState<number>(0);
  const lastUpdateTime = useRef<number>();
  const { playerState } = useSpotifyPlayer();
  const trackId = playerState?.track_window?.current_track?.id;
  
  useEffect(() => {
    const { id, name, duration_ms, album } = playerState?.track_window?.current_track || {};
    setTrack({
      id,
      name,
      duration: duration_ms,
      albumName: album?.name,
      albumCoverUrl: album?.images[0].url,
      isPlaying: !playerState?.paused,
      progress: playerState?.position,
    });
    lastUpdateTime.current = Tone.now() * 1000;
  }, [
    playerState?.paused,
    playerState?.position,
    trackId,
  ]);
  
  useEffect(() => {
    if(!trackId) return;
    getTrackAnalysis(trackId)
        .then(({ beats, track: { tempo } }) => {
          setBeats(beats.map(({ start }) => start));
          setTempo(tempo);
        })
        .catch(setError);
  }, [trackId]);
  
  return { track, error, beats, lastUpdateTime: lastUpdateTime.current, tempo };
}

function useProgress({ track, beats, lastUpdateTime }) {
  const [beatIndex, setBeatIndex] = useState<number>(0);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const updateProgress = time => {
      const currentProgress = track.progress + (time - lastUpdateTime);
      setProgress(currentProgress);
      setBeatIndex(prevBeatIndex => {
        let nextBeatIndex = 0;
        while(currentProgress / 1000 > beats[nextBeatIndex]) nextBeatIndex++;
        if(nextBeatIndex !== prevBeatIndex) {
            console.log(beats[nextBeatIndex] * 1000 - currentProgress)
            synth.triggerAttackRelease('C3', '16n');
        }
        return nextBeatIndex;
      });
    };
    if(track?.isPlaying) Timer.start(updateProgress);
    return () => Timer.stop();
  }, [track?.isPlaying, track?.progress, beats, lastUpdateTime, beatIndex]);
  
  return { progress, beatIndex };
}

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