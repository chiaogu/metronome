import { parseGIF, decompressFrames } from 'gifuct-js'

const cache = {};

export async function getGifFrames(url) {
  if(cache[url]) return cache[url];
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const gif = await parseGIF(buffer);
  cache[url] = await decompressFrames(gif, true);
  return cache[url];
}

export function drawOnOffScreenCanvas(frame) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = frame.dims.width;
  canvas.height = frame.dims.height;
  const frameImage = ctx.createImageData(frame.dims.width, frame.dims.height);
  frameImage.data.set(frame.patch);
  ctx.putImageData(frameImage, 0, 0);
  return canvas;
}

export function getFrameCanvases(frames) {
  return frames.map((frame, i) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = frame.dims.width;
    canvas.height = frame.dims.height;
    for(let j = 0; j <= i; j++) {
      ctx.drawImage(drawOnOffScreenCanvas(frames[j]), 0, 0);
    }
    return canvas;
  });
}

export function getAverageDelay(frames) {
  const sum = frames.reduce((sum, { delay }) => sum + delay, 0);
  return sum / frames.length;
}

export function isFrameOnBeat(frame, frames, beats, offset) {
  let isOnBeat = false;
  for(let i = 0; i < beats; i++) {
    const beatIndex = (Math.floor(i / beats * frames) + offset) % frames;
    isOnBeat = frame === beatIndex;
    if(isOnBeat) break;
  }
  return isOnBeat;
}