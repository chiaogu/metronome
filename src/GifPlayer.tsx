import { h } from 'preact';
import { parseGIF, decompressFrames } from 'gifuct-js'
import { useEffect, useRef } from 'preact/hooks';

async function getGifFrames(url) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const gif = await parseGIF(buffer);
  return await decompressFrames(gif, true);
}

function drawOnOffScreenCanvas(frame) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = frame.dims.width;
  canvas.height = frame.dims.height;
  const frameImage = ctx.createImageData(frame.dims.width, frame.dims.height);
  frameImage.data.set(frame.patch);
  ctx.putImageData(frameImage, 0, 0);
  return canvas;
}
    
export default function GifPlayer({ bpm }) {
  const ref = useRef<HTMLCanvasElement>();
  
  useEffect(() => {
    (async () => {
      const frames = await getGifFrames('https://media.giphy.com/media/1GrsfWBDiTN60/giphy.gif');
      console.log(frames);
      const ctx = ref.current.getContext('2d');
      ctx.canvas.width = frames[0].dims.width;
      ctx.canvas.height = frames[0].dims.height;
      let index = 0;
      let lastTimeDraw = Date.now();
      
      function draw() {
        const frame = frames[index];
        if(Date.now() - lastTimeDraw >= 90) {
          ctx.drawImage(drawOnOffScreenCanvas(frame), 0, 0);
          lastTimeDraw = Date.now();
          index = (index + 1) % frames.length;
        }
        requestAnimationFrame(draw);
      }
      draw();
    })();
  }, []);
  
  return (
    <canvas ref={ref}/>
  );
}