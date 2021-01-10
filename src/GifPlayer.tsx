import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import * as Timer from './utils/timer';
import { getGifFrames, drawOnOffScreenCanvas } from './utils/gif';
    
export default function GifPlayer(props) {
  const ref = useRef<HTMLCanvasElement>();
  const bpm = useRef(60);
  
  useEffect(() => {
    bpm.current = props.bpm;
  }, [props.bpm]);
  
  useEffect(() => {
    let index = 0;
    let lastTimeDraw = Date.now();
    let animationId;
    
    (async () => {
      const frames = await getGifFrames('https://media.giphy.com/media/1GrsfWBDiTN60/giphy.gif');
      const ctx = ref.current.getContext('2d');
      ctx.canvas.width = frames[0].dims.width;
      ctx.canvas.height = frames[0].dims.height;
      ctx.canvas.style.width = `${ctx.canvas.width}px`;
      ctx.canvas.style.height = `${ctx.canvas.height}px`;
      
      function draw() {
        // console.log(bpm.current);
        const frame = frames[index];
        if(Date.now() - lastTimeDraw >= frame.delay) {
          ctx.drawImage(drawOnOffScreenCanvas(frame), 0, 0);
          lastTimeDraw = Date.now();
          index = (index + 1) % frames.length;
        }
        animationId = requestAnimationFrame(draw);
      }
      draw();
    })();
    
    return () => {
      if(animationId) cancelAnimationFrame(animationId);
    }
  }, []);
  
  return (
    <canvas ref={ref}/>
  );
}