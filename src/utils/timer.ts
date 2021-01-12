import { WORKER_EVENT } from './shared';
import * as Tone from 'tone';

const listeners = [];
const worker = new Worker('worker.js');
worker.postMessage([WORKER_EVENT.STOP]);
worker.onmessage = () => {
  listeners.forEach(callback => callback(Tone.now() * 1000));
};

export function addListener(listener) {
  listeners.push(listener);
  if(listeners.length === 1) worker.postMessage([WORKER_EVENT.START]);
}

export function removeListener(listener) {
  const index = listeners.findIndex(callback => callback === listener);
  if(index !== -1) listeners.splice(index, 1);
  if(listeners.length === 0) worker.postMessage([WORKER_EVENT.STOP]);
}


const toneListeners = [];
let isDownbeat = true;
const synth = new Tone.MembraneSynth({ volume: 0 }).toDestination();
Tone.Transport.scheduleRepeat(time => {
  if(isDownbeat) {
    // synth.triggerAttackRelease('C3', '8n', time);
    // console.timeEnd('tick');
    // console.time('tick');
    toneListeners.forEach(callback => callback(time, isDownbeat));
  }
  isDownbeat = !isDownbeat;
}, '8n');

export function addToneListener(listener) {
  toneListeners.push(listener);
  if(toneListeners.length === 1) Tone.Transport.start();
}

export function removeToneListener(listener) {
  toneListeners.splice(toneListeners.findIndex(callback => callback === listener), 1);
  if(toneListeners.length === 0) Tone.Transport.stop();
}

export function setToneBpm(bpm) {
  Tone.Transport.bpm.setValueAtTime(bpm, Tone.now());
}