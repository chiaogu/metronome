import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import * as Timer from './utils/timer';
import { getGifFrames, getFrameCanvases } from './utils/gif';
import useSharedState from './useSharedState';
import * as Tone from 'tone';
import { GIF_META } from './constants';
    
export default function GifPlayer({ url }) {
  const { bpm } = useSharedState();
  const ref = useRef<HTMLCanvasElement>();
  const bpmRef = useRef(60);
  const frameCanvases = useRef([]);
  const frameQueue = useRef([]);
  
  useEffect(() => {
    if(bpm) bpmRef.current = bpm;
  }, [bpm]);
  
  useEffect(() => {
    (async () => {
      const frames = await getGifFrames(url);
      const meta = GIF_META[url];
      frameCanvases.current = getFrameCanvases(frames, meta.offset);
      
      const canvas = ref.current;
      canvas.width = frames[0].dims.width;
      canvas.height = frames[0].dims.height;
      canvas.style.width = `${canvas.width}px`;
      canvas.style.height = `${canvas.height}px`;
    })();
  }, [url]);
  
  useEffect(() => {
    const tick = time => {
      const beatInterval = 60 / bpmRef.current * 1000;
      const frameInterval = beatInterval / frameCanvases.current.length;
      frameQueue.current = frameCanvases.current.map((frame, index) => ({
        time: time * 1000 + frameInterval * index,
        image: frame,
      }));
    };
    Timer.addToneListener(tick);
    return () => Timer.removeListener(tick);
  }, [])
  
  useEffect(() => {
    let lastTimeOnBeat;
    let animationId;
    const ctx = ref.current.getContext('2d');
    
    function draw() {
      const isOnBeat = frameQueue.current.length === frameCanvases.current.length;
      
      while(Tone.now() * 1000 >= frameQueue.current[0]?.time) {
        ctx.drawImage(frameQueue.current[0].image, 0, 0);
        frameQueue.current.shift();
      }
      
      if(isOnBeat || Tone.now() * 1000 - lastTimeOnBeat < 100) {
        ctx.font = '72px mono';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`👏`, ctx.canvas.width, ctx.canvas.height);
        if(isOnBeat) lastTimeOnBeat = Tone.now() * 1000;
      }
      
      animationId = requestAnimationFrame(draw);
    }
    draw();
    
    return () => {
      if(animationId) cancelAnimationFrame(animationId);
    }
  }, []);
  
  return (
    <canvas ref={ref}/>
  );
}