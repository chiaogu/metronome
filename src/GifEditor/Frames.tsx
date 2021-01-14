import { h } from 'preact';
import { useCallback, useEffect, useRef } from 'preact/hooks';
import { isFrameOnBeat } from '../utils/gif';

const FRAME_LABEL_WIDTH = 48;
const FRAME_MARGIN = 17;
const FRAME_WIDTH = FRAME_LABEL_WIDTH + FRAME_MARGIN * 2;

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
    
    const isEvenFrame = Math.floor(container.current.clientWidth / FRAME_WIDTH) % 2 === 0;
    const center = 
      content.current.clientWidth 
      - container.current.clientWidth % FRAME_WIDTH / 2
      + (isEvenFrame ? FRAME_WIDTH / 2 : 0);
      
    // container.current.scrollLeft = center;
  }, [frames, onPreviewFrameChange]);
  
  useEffect(() => {
    const onWheel = event => {
      event.preventDefault();
      if(Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
        scroll(event.deltaY);
      } else {
        scroll(-event.deltaX);
      }
    };
    container.current.addEventListener('wheel', onWheel);
    return () => {
      container.current.removeEventListener('wheel', onWheel);
    }
  }, [scroll]);
  
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