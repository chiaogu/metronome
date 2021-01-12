import { getCurrentPlayback, getTrackAnalysis } from './spotifyApi';
import * as Tone from 'tone';
import * as Timer from './timer';
import { BASE_BPM } from '../constants';

function startPolling({ onUpdate, onError }) {
  let trackId;
  let analysis;

  const loadTrack = async () => {
    try{
      const track = await getCurrentPlayback();
      if(track.type !== 'track') throw new Error(`Not playing music`);
      if(track.id !== trackId) {
        trackId = track.id;
        analysis = await getTrackAnalysis(track.id);
      }
      const { beats, track: { tempo } } = analysis;
      onUpdate({
        track, 
        tempo,
        beats: beats.map(({ start }) => start),
      });
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
        const currentBpm = 1 / (beats[nextBeatIndex] - beats[prevBeatIndex]) * BASE_BPM;
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


let stopListening;
let snapshot = {} as any;
const listeners = [];
export function addListener(listener) {
  listeners.push(listener);
  if(listeners.length === 1) stopListening = listen();
  if(snapshot.track && listener.onTrackUpdate) listener.onTrackUpdate(snapshot.track);
  if(snapshot.progress && listener.onProgress) listener.onProgress(snapshot.progress);
  if(snapshot.beat && listener.onBeat) listener.onBeat(snapshot.beat);
}

export function removeListener(listener) {
  const index = listeners.findIndex(callback => callback === listener);
  if(index !== -1) listeners.splice(index, 1);
  if(listeners.length === 0 && stopListening) stopListening(); 
}

function listen() {
  let lastUpdateTime;
  
  const stopPolling = startPolling({
    onUpdate: data => {
      snapshot.track = data;
      lastUpdateTime = Tone.now() * 1000;
      listeners.forEach(({ onTrackUpdate }) => onTrackUpdate && onTrackUpdate(data));
    },
    onError: data => {
      listeners.forEach(({ onError }) => onError && onError(data));
    },
  });
  
  const stopTracking = trackProgress({
    getTrack: () => ({ ...snapshot?.track, lastUpdateTime }),
    onProgress: data => {
      snapshot.progress = data;
      listeners.forEach(({ onProgress }) => onProgress && onProgress(data));
    },
    onBeat: data => {
      snapshot.beat = data;
      listeners.forEach(({ onBeat }) => onBeat && onBeat(data));
    },
  });
  
  return () => {
    stopPolling();
    stopTracking();
  }
}