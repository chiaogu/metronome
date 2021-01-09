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
  listeners.splice(listeners.findIndex(callback => callback === listener), 1);
  if(listeners.length === 0) worker.postMessage([WORKER_EVENT.STOP]);
}