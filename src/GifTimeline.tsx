import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import GifPlayer from './GifPlayer';
import { getGifFrames, getFrameCanvases, getAverageDelay } from './utils/gif';
import { GIF_META } from './constants';

function drawFrame(ctx, frame, x, y, dSize) {
  const w = frame.width;
  const h = frame.height;
  const sSize = Math.min(w, h);
  const offsetX = w > h ? (w - sSize) / 2 : 0;
  const offsetY = w <= h ? (h - sSize) / 2 : 0;
  ctx.drawImage(frame, offsetX, offsetY, sSize, sSize, x, y, dSize, dSize);
}

export default function GifTimeline({ url }) {
  const ref = useRef<HTMLCanvasElement>();
  
  useEffect(() => {
    const ctx = ref.current.getContext('2d');
    let scrollY = 0;
    let frameCanvases = [];
    let meta = {
      offset: 0,
      beats: 1
    };
    let animationId;
    
    (async () => {
      const frames = await getGifFrames(url);
      meta = GIF_META[url];
      frameCanvases = getFrameCanvases(frames);
      // const frameInterval = getAverageDelay(frames);
      // console.log(frameInterval, frames.length * frameInterval);
      
      ctx.canvas.width = ctx.canvas.clientWidth;
      ctx.canvas.height = ctx.canvas.clientHeight;
      const size = ctx.canvas.width / 2;
      
      ctx.canvas.addEventListener('wheel', event => {
        event.preventDefault();
        scrollY += event.deltaY;
        if(scrollY <= -size * frames.length) {
          scrollY = 0;
        }
        if(scrollY > 0) {
          scrollY = -size * frames.length;
        }
      })
    })();
    
    function draw() {
      if(frameCanvases.length > 0) {
        ctx.beginPath();
        ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = '#fff';
        ctx.fill();
        
        const size = ctx.canvas.width / 2;
        const duplicateTime = Math.max(2, Math.ceil(ctx.canvas.height / (size * frameCanvases.length) * 2));
        frameCanvases.forEach((frame, index) => {
          for(let i = 0; i < duplicateTime; i++) {
            const y = (index + i * frameCanvases.length) * size + scrollY;
            drawFrame(ctx, frame, 0, y, size);
            
            ctx.font = '24px mono';
            ctx.textBaseline = 'top';
            ctx.textAlign = 'left';
            ctx.fillStyle = '#fff';
            ctx.fillText(`${index}`, 0, y)
            
            if(index === 0) {
              ctx.beginPath();
              ctx.moveTo(0, y);
              ctx.lineTo(ctx.canvas.width, y);
              ctx.strokeStyle = '#000';
              ctx.stroke();      
            }
          }
        });
        
        for(let i = 0; i < duplicateTime; i++) {
          for(let j = 0; j < meta.beats; j++) {
            ctx.font = '72px mono';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            const beatOffsetIndex = Math.floor(j / meta.beats * frameCanvases.length);
            const frameIndex = (meta.offset + beatOffsetIndex) % frameCanvases.length;
            const y = (frameIndex + i * frameCanvases.length) * size + scrollY + size / 2;
            ctx.fillText(`👏`, ctx.canvas.width, y);
          }
        }
      }
      animationId = requestAnimationFrame(draw);
    }
    draw();
    return () => {
      if(animationId) cancelAnimationFrame(animationId);
    }
  }, [url]);
  
  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
      }}
    >
      <canvas
        ref={ref}
        style={{
          border: '1px solid black',
          width: '300px',
          height: '100%',
        }}
      />
      <GifPlayer url={url}/>
    </div>
  );
}