import { useEffect, useRef, useState } from 'preact/hooks';
import { getCurrentPlayback, getTrackAnalysis, Track } from './spotifyApi';
import * as Tone from 'tone';
import useSpotifyPlayer from './useSpotifyPlayer';

function usePolling() {
  const [error, setError] = useState<Error>(null);
  const [track, setTrack] = useState<Track>(null);
  const lastUpdateTime = useRef<number>();
  
  useEffect(() => {
    const loadTrack = () => {
      getCurrentPlayback()
        .then(track => {
          setTrack(track);
          lastUpdateTime.current = Tone.now() * 1000;
        })
        .catch(setError);
    };
    loadTrack();
    const intervalId = setInterval(loadTrack, 5000);
    return () => clearInterval(intervalId);
  }, []);
  
  return { track, error, lastUpdateTime };
}

function useSpotifySdk() {
  const [error, setError] = useState<Error>(null);
  const [track, setTrack] = useState<Track>(null);
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
  
  return { track, error, lastUpdateTime };
}

export default function useTrack(): {
  track: Track;
  error: Error;
  beats: number[];
  lastUpdateTime: number;
  tempo: number;
} {
  const [error, setError] = useState<Error>(null);
  const [beats, setBeats] = useState<number[]>([]);
  const [tempo, setTempo] = useState<number>(0);
  const { track, error: trackError, lastUpdateTime } = usePolling();
  
  useEffect(() => {
    if(!track?.id) return;
    getTrackAnalysis(track.id)
        .then(({ beats, track: { tempo } }) => {
          setBeats(beats.map(({ start }) => start));
          setTempo(tempo);
        })
        .catch(setError);
  }, [track?.id]);
  
  return { track, error: error || trackError, beats, lastUpdateTime: lastUpdateTime.current, tempo };
}