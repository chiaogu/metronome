import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import * as Timer from './utils/timer';
import { getGifFrames, getFrameCanvases, getAverageDelay } from './utils/gif';
import useSharedState from './useSharedState';
import { BASE_BPM } from './constants';
import { Tone } from 'tone/build/esm/core/Tone';
    
export default function GifPlayer({ beatFrameIndex }) {
  const { bpm } = useSharedState();
  const ref = useRef<HTMLCanvasElement>();
  const bpmRef = useRef(60);
  
  useEffect(() => {
    if(bpm) bpmRef.current = bpm;
  }, [bpm]);
  
  useEffect(() => {
    let index = beatFrameIndex;
    let lastTimeDraw = 0;
    let lastTimeDrawBeat = 0;
    let animationId;
    
    Timer.addToneListener(time => {
      index = beatFrameIndex;
      lastTimeDraw = 0;
      lastTimeDrawBeat = 0;
    });
    
    (async () => {
      const frames = await getGifFrames('https://media.giphy.com/media/6mr2y6RGPcEU0/giphy.gif');
      const frameCanvases = getFrameCanvases(frames);
      
      const ctx = ref.current.getContext('2d');
      ctx.canvas.width = frames[0].dims.width;
      ctx.canvas.height = frames[0].dims.height;
      ctx.canvas.style.width = `${ctx.canvas.width}px`;
      ctx.canvas.style.height = `${ctx.canvas.height}px`;
      
      function draw() {
        const beatInterval = 60 / bpmRef.current * 1000;
        const frameInterval = beatInterval / frames.length;
        console.log(frameInterval, beatInterval);
        if(Date.now() - lastTimeDraw >= frameInterval || Date.now() - lastTimeDrawBeat >= beatInterval) {
          ctx.drawImage(frameCanvases[index], 0, 0);
          
          ctx.font = '24px mono';
          ctx.textBaseline = 'top';
          ctx.fillStyle = '#fff';
          ctx.fillText(`${index}`, 0, 0)

          const isOnBeat = index === beatFrameIndex;
          if(isOnBeat || Date.now() - lastTimeDrawBeat < 100) {
            ctx.font = '72px mono';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            ctx.fillText(`👏`, ctx.canvas.width, ctx.canvas.height);
            
            if(isOnBeat) {
              console.timeEnd('beat');
              console.time('beat');
              lastTimeDrawBeat = Date.now();
            }
          }
          
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
  }, [beatFrameIndex]);
  
  return (
    <canvas ref={ref}/>
  );
}