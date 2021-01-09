import { WORKER_EVENT } from './shared';
import * as Tone from 'tone';

const worker = new Worker('worker.js');

worker.postMessage([WORKER_EVENT.STOP]);

export function start(callback: (number) => void) {
  worker.onmessage = () => callback(Tone.now() * 1000);
  worker.postMessage([WORKER_EVENT.START]);
}

export function stop() {
  worker.postMessage([WORKER_EVENT.STOP]);
}