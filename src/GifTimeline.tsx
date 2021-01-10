import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import GifPlayer from './GifPlayer';
import { getGifFrames, getFrameCanvases } from './utils/gif';

function drawFrame(ctx, frame, x, y, dSize) {
  const w = frame.width;
  const h = frame.height;
  const sSize = Math.min(w, h);
  const offsetX = w > h ? (w - sSize) / 2 : 0;
  const offsetY = w <= h ? (h - sSize) / 2 : 0;
  ctx.drawImage(frame, offsetX, offsetY, sSize, sSize, x, y, dSize, dSize);
}

export default function GifTimeline({ }) {
  const ref = useRef<HTMLCanvasElement>();
  
  useEffect(() => {
    (async () => {
      const frames = await getGifFrames('https://media.giphy.com/media/1GrsfWBDiTN60/giphy.gif');
      const frameCanvases = getFrameCanvases(frames);
      const ctx = ref.current.getContext('2d');
      ctx.canvas.width = ctx.canvas.clientWidth;
      ctx.canvas.height = ctx.canvas.clientHeight;
      const size = ctx.canvas.width / 2;
      let offsetY = 0;
      
      ctx.canvas.addEventListener('wheel', event => {
        event.preventDefault();
        offsetY += event.deltaY;
        if(offsetY <= -size * frames.length) {
          offsetY = 0;
        }
        if(offsetY > 0) {
          offsetY = -size * frames.length;
        }
      })
      
      function draw() {
        const duplicateTime = Math.ceil(ctx.canvas.height / (size * frameCanvases.length) * 2);
        frameCanvases.forEach((frame, index) => {
          for(let i = 0; i < duplicateTime; i++) {
            const y = (index + i * frameCanvases.length) * size + offsetY;
            drawFrame(ctx, frame, 0, y, size);
            ctx.font = '24px mono';
            ctx.textBaseline = 'top';
            ctx.fillStyle = '#fff';
            ctx.fillText(`${index}`, 0, y)
          }
        });
        requestAnimationFrame(draw);
      }
      draw();
    })();
  }, []);
  
  return (
    <canvas
      ref={ref}
      style={{
        border: '1px solid black',
        width: '300px',
        height: '100%',
      }}
    />
  );
}