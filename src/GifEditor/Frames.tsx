import { h } from 'preact';
import { useCallback, useEffect, useRef } from 'preact/hooks';
import { isFrameOnBeat } from '../utils/gif';

const FRAME_LABEL_WIDTH = 48;
const FRAME_MARGIN = 17;
const FRAME_WIDTH = FRAME_LABEL_WIDTH + FRAME_MARGIN * 2;

function useScroll(ref, callback) {
  const onScroll = useCallback(({ deltaX, deltaY }) => {
    if(Math.abs(deltaY) > Math.abs(deltaX)) {
      callback(deltaY);
    } else {
      callback(-deltaX);
    }
  }, [callback]);
  
  useEffect(() => {
    if(!ref) return;
    const onWheel = event => {
      event.preventDefault();
      const { deltaX, deltaY } = event;
      onScroll({ deltaX, deltaY });
    };
    ref.addEventListener('wheel', onWheel);
    return () => {
      ref.removeEventListener('wheel', onWheel);
    }
  }, [ref]);
  
  useEffect(() => {
    if(!ref) return;
    let animation;
    let lastTouchX;
    let v;
    
    const inertialScroll = () => {
      const delta = 0.5;
      if(v > 0) {
        v -= delta;
        onScroll({ deltaX: v, deltaY: 0 });
        if(v >= 0) requestAnimationFrame(inertialScroll);
      } else {
        v += delta;
        onScroll({ deltaX: v, deltaY: 0 });
        if(v <= 0) requestAnimationFrame(inertialScroll);
      }
    }
    
    const onTouchStart = ({ touches: [{ clientX }] }) => {
      if(animation) cancelAnimationFrame(animation);
      lastTouchX = clientX;
    }
    const onTouchMove = event => {
      event.preventDefault();
      const { touches: [{ clientX }] } = event;
      v = clientX - lastTouchX
      lastTouchX = clientX;
      onScroll({ deltaX: v, deltaY: 0 });
    };
    const onTouchEnd = () => {
      inertialScroll();
    };
    ref.addEventListener('touchstart', onTouchStart);
    ref.addEventListener('touchmove', onTouchMove);
    ref.addEventListener('touchend', onTouchEnd);
    return () => {
      ref.removeEventListener('touchstart', onTouchStart);
      ref.removeEventListener('touchmove', onTouchMove);
      ref.removeEventListener('touchend', onTouchEnd);
    }
  }, [ref]);
}

export default function Frames({ frames, offset, beats, onOffsetChange, previewFrame, onPreviewFrameChange }) {
  const container = useRef<HTMLElement>();
  const content = useRef<HTMLElement>();
  
  const scroll = useCallback(delta => {
    container.current.scrollLeft += delta;
    if(container.current.scrollLeft >= content.current.clientWidth) {
      container.current.scrollLeft %= content.current.clientWidth
    }
    if(container.current.scrollLeft === 0) {
      container.current.scrollLeft = content.current.clientWidth;
    }

    const offset = Math.round(container.current.scrollLeft / FRAME_WIDTH);
    const centerIndex = Math.round(container.current.clientWidth / FRAME_WIDTH / 2);
    const centerFrame = (offset + centerIndex) % frames.length;
    onPreviewFrameChange(centerFrame);
  }, [frames, onPreviewFrameChange]);
  
  useScroll(container.current, scroll);
  
  useEffect(() => {
    const visibleFrameCount = Math.ceil(container.current.clientWidth / FRAME_WIDTH);
    const offset = Math.round(visibleFrameCount / 2) - 1;
    const isEvenFrame = Math.floor(container.current.clientWidth / FRAME_WIDTH) % 2 === 0;
    const center = 
      content.current.clientWidth 
      - container.current.clientWidth % FRAME_WIDTH / 2
      + (isEvenFrame ? FRAME_WIDTH / 2 : 0);
    container.current.scrollLeft = center + (previewFrame - offset) * FRAME_WIDTH;
  }, []);
  
  return (
    <div
      ref={container}
      style={{
        width: '100%',
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {Array(2).fill(0).map(() => (
        <div
          ref={content}
          style={{
            height: '100%',
            flex: '0 0 auto',
            display: 'flex',
            alignItems: 'center',
            color: '#fff',
          }}
        >
          {
            frames.map((_, index) => {
              const isOnBeat = isFrameOnBeat(index, frames.length, beats, offset);
              const isHighlight = previewFrame === undefined || previewFrame === index;
              return (
                <div
                  onClick={() => onOffsetChange(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    width: `${FRAME_LABEL_WIDTH}px`,
                    flex: '0 0 auto',
                    padding: `0 ${FRAME_MARGIN}px`,
                    fontFamily: 'monospace',
                    fontSize: isOnBeat ? '48px' : '24px',
                    opacity: isHighlight || isOnBeat ? 1 : 0.3,
                    cursor: isOnBeat ? 'default' : 'pointer',
                    userSelect: 'none',
                  }}
                >
                  {isOnBeat ? '👏' : `${index + 1}`}
                </div>
              );
            })
          }
        </div>
      ))}
    </div>
  )
}