import { h } from 'preact';
import { useCallback, useEffect, useRef } from 'preact/hooks';
import { getGifFrames, getFrameCanvases, isFrameOnBeat } from './utils/gif';
import useSharedState from './useSharedState';
import * as Tone from 'tone';
import { BASE_BPM } from './constants';
import useBeat from './useBeat';
    
export default function GifPlayer({ url, style, previewFrame, meta, onFrameChange }: { url, meta, style?, previewFrame?, onFrameChange? }) {
  const { bpm } = useSharedState();
  const ref = useRef<HTMLCanvasElement>();
  const bpmRef = useRef(bpm);
  const frameCanvases = useRef([]);
  const frameQueue = useRef([]);
  const gifMeta = useRef({
    offset: 0,
    beats: 1,
  });
  const beat = useRef(0);
  const previewFrameRef = useRef(undefined);
  
  const onBeat = useCallback(() => {
    const beatInterval = BASE_BPM / bpmRef.current * 1000 * gifMeta.current.beats;
    const frameInterval = beatInterval / frameCanvases.current.length;
    if(frameCanvases.current.length !== 0 && beat.current === 0) {
      const canvases = frameCanvases.current.slice();
      const head = canvases.splice(0, gifMeta.current.offset);
      frameQueue.current = [
        ...canvases,
        ...head
      ].map((frame, index) => ({
        time: Tone.now() * 1000 + frameInterval * index,
        image: frame,
      }));
    }
    beat.current = (beat.current + 1) % gifMeta.current.beats;
  }, []);
  
  useBeat(onBeat);
  
  useEffect(() => {
    if(bpm) bpmRef.current = bpm;
  }, [bpm]);
  
  useEffect(() => {
    previewFrameRef.current = previewFrame;
  }, [previewFrame]);
  
  useEffect(() => {
    gifMeta.current = meta;
  }, [meta]);
  
  useEffect(() => {
    let animationId;
    
    (async () => {
      const frames = await getGifFrames(url);
      frameCanvases.current = getFrameCanvases(frames);
      
      const canvas = ref.current;
      canvas.width = frames[0].dims.width;
      canvas.height = frames[0].dims.height;
      // canvas.style.width = `${canvas.width}px`;
      // canvas.style.height = `${canvas.height}px`;
      
      const ctx = ref.current.getContext('2d');
      const getCurrentFrameIndex = () => (
        frameCanvases.current.length
        - frameQueue.current.length
        + gifMeta.current.offset
      ) % frameCanvases.current.length;
      
      function draw() {
        if(previewFrameRef.current === undefined) {
          const isOnBeat = isFrameOnBeat(
            getCurrentFrameIndex(),
            frameCanvases.current.length,
            gifMeta.current.beats,
            gifMeta.current.offset
          );
          
          while(Tone.now() * 1000 >= frameQueue.current[0]?.time) {
            ctx.drawImage(frameQueue.current[0].image, 0, 0);
            frameQueue.current.shift();
          }
          
          onFrameChange(getCurrentFrameIndex());
        } else {
          ctx.drawImage(frameCanvases.current[previewFrameRef.current], 0, 0);
        }        
        
        animationId = requestAnimationFrame(draw);
      }
      draw();
    })(); 
    
    return () => {
      if(animationId) cancelAnimationFrame(animationId);
    }
  }, [url]);
  
  return (
    <canvas ref={ref} style={style}/>
  );
}