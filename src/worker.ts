import { WORKER_EVENT } from './utils/shared';
 
let intervalId;

onmessage = ({ data: [event] }) => {
  if(event === WORKER_EVENT.START) {
    intervalId = setInterval(() => postMessage(0), 16);
  } else if(event === WORKER_EVENT.STOP) {
    if(intervalId) clearInterval(intervalId);
  }
}