import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import * as Timer from './utils/timer';
import { getGifFrames, getFrameCanvases } from './utils/gif';
import useSharedState from './useSharedState';
import * as Tone from 'tone';
import { GIF_META } from './constants';
import listen from './utils/listen';
    
export default function GifPlayer({ url }) {
  const { bpm } = useSharedState();
  const ref = useRef<HTMLCanvasElement>();
  const bpmRef = useRef(60);
  const frameCanvases = useRef([]);
  const frameQueue = useRef([]);
  const gifMeta = useRef({
    offset: 0,
    beats: 1,
  });
  
  useEffect(() => {
    if(bpm) bpmRef.current = bpm;
  }, [bpm]);
  
  useEffect(() => {
    let stopListening;
    let isCancelled = false;
    let beats = 1;
    let beat = 0;
    
    const tick = time => {
      const beatInterval = 60 / bpmRef.current * 1000 * beats;
      const frameInterval = beatInterval / frameCanvases.current.length;
      if(beat === 0) {
        frameQueue.current = frameCanvases.current.map((frame, index) => ({
          time: time * 1000 + frameInterval * index,
          image: frame,
        }));
      }
      beat = (beat + 1) % beats;
    };
    
    (async () => {
      const frames = await getGifFrames(url);
      gifMeta.current = GIF_META[url];
      beats = gifMeta.current.beats;
      frameCanvases.current = getFrameCanvases(frames, gifMeta.current.offset);
      
      const canvas = ref.current;
      canvas.width = frames[0].dims.width;
      canvas.height = frames[0].dims.height;
      canvas.style.width = `${canvas.width}px`;
      canvas.style.height = `${canvas.height}px`;
      if(!isCancelled) {
        // stopListening = listen({
        //   onTrackChange: () => {},
        //   onProgress: () => {},
        //   onError: () => {},
        //   onBeat: ({ bpm }) => {
        //     tick(Tone.now());
        //     bpmRef.current = bpm;
        //   }
        // });
        Timer.addToneListener(tick);
      }
    })();
    
    return () => {
      // if(stopListening) stopListening();
      isCancelled = true;
      Timer.removeListener(tick);
    }
  }, [url]);
  
  useEffect(() => {
    let lastTimeOnBeat;
    let animationId;
    const ctx = ref.current.getContext('2d');
    
    function draw() {
      let isOnBeat = false;
      for(let i = 0; i < gifMeta.current.beats; i++) {
        const index = frameCanvases.current.length - frameQueue.current.length;
        const beatIndex = Math.floor(i / gifMeta.current.beats * frameCanvases.current.length);
        isOnBeat = index === beatIndex;
        if(isOnBeat) break;
      }
      
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