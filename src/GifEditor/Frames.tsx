import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { isFrameOnBeat } from '../utils/gif';

export default function Frames({ frames, offset, beats, onOffsetChange, previewFrame = 0 }) {
  const container = useRef<HTMLElement>();
  const content = useRef<HTMLElement>();
  
  function scroll(delta) {
    container.current.scrollLeft += delta;
    if(container.current.scrollLeft >= content.current.clientWidth) {
      container.current.scrollLeft %= content.current.clientWidth
    }
    if(container.current.scrollLeft === 0) {
      container.current.scrollLeft = content.current.clientWidth;
    }
  }
  
  useEffect(() => {
    container.current.addEventListener('wheel', event => {
      event.preventDefault();
      if(Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
        scroll(event.deltaY);
      } else {
        scroll(-event.deltaX);
      }
    })
  }, []);
  
  return (
    <div
      ref={container}
      style={{
        marginTop: '48px',
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
              return (
                <span
                  onClick={() => onOffsetChange(index)}
                  style={{
                    flex: '0 0 auto',
                    fontFamily: 'monospace',
                    fontSize: isOnBeat ? '48px' : '24px',
                    margin: isOnBeat ? '0 17px' : '0 24px',
                    cursor: isOnBeat ? 'default' : 'pointer',
                  }}
                >
                  {isOnBeat ? '👏' : `${index + 1}`}
                </span>
              );
            })
          }
        </div>
      ))}
    </div>
  )
}