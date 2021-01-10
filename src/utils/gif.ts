import { parseGIF, decompressFrames } from 'gifuct-js'

export async function getGifFrames(url) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const gif = await parseGIF(buffer);
  return await decompressFrames(gif, true);
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
  })
}