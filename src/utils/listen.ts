import { getCurrentPlayback, getTrackAnalysis, Track } from './spotifyApi';
import * as Tone from 'tone';
import * as Timer from './timer';

function startPolling({ onUpdate, onError }) {
  let trackId;
  let analysis;
  const loadTrack = async () => {
    try{
      const track = await getCurrentPlayback();
      if(track.id !== trackId || !analysis) {
        analysis = await getTrackAnalysis(track.id);
        trackId = track.id;
      }
      const { beats, track: { tempo } } = analysis;
      onUpdate({
        track, 
        tempo,
        beats: beats.map(({ start }) => start),
      })
    } catch(e) {
      onError(e);
    }
  };
  loadTrack();
  const intervalId = setInterval(loadTrack, 5000);
  return () => clearInterval(intervalId);
}


function trackProgress({ getTrack, onProgress, onBeat }) {
  let progress;
  let prevBeatIndex;
  let beatIndex;
  let bpm;
  let trackId;
  let prevTrackProgress;
  
  const updateProgress = time => {
    const trackData = getTrack();
    if(!trackData?.track) return;
    
    const { track, beats, lastUpdateTime } = trackData;
    progress = track.progress + (time - lastUpdateTime);
    onProgress(progress);
    
    if(track.id !== trackId || track.progress < prevTrackProgress) {
      progress = 0;
      prevBeatIndex = 0;
      beatIndex = 0;
      bpm = 0;
      trackId = track.id;
    }
    
    prevTrackProgress= track.progress;
    
    let nextBeatIndex = prevBeatIndex;
    while(beats[nextBeatIndex] * 1000 - progress < 30) {
      nextBeatIndex++;
    }
    if(prevBeatIndex !== nextBeatIndex) {
      if(prevBeatIndex !== 0) {
        beatIndex = nextBeatIndex;
        const currentBpm = 1 / (beats[nextBeatIndex] - beats[prevBeatIndex]) * 60;
        if(Math.abs(bpm - currentBpm) < 10) {
          onBeat({ beatIndex, bpm });
        }
        bpm = currentBpm;
      }
      prevBeatIndex = nextBeatIndex;
    }
  };
  Timer.addListener(updateProgress);
  return () => Timer.removeListener(updateProgress);
}

export default function listen({ onTrackChange, onProgress, onBeat, onError }) {
  let track;
  let lastUpdateTime;
  
  const stopPolling = startPolling({
    onUpdate: data => {
      track = data;
      lastUpdateTime = Tone.now() * 1000;
      onTrackChange(data);
    },
    onError,
  });
  
  const stopTracking = trackProgress({
    getTrack: () => ({ ...track, lastUpdateTime }),
    onProgress,
    onBeat,
  });
  
  return () => {
    stopPolling();
    stopTracking();
  }
}