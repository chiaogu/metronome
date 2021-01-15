import { h } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { GIF_META } from '../constants';
import GifPlayer from '../GifPlayer';
import useBeat from '../useBeat';
import useSharedState from '../useSharedState';
import { getGifFrames } from '../utils/gif';
import Frames from './Frames';

const MAX_BEATS = 16;

function getMeaxBeats(frames) {
  let closestBeat = 1;
  while(Math.floor(frames / 8) > closestBeat) closestBeat <<= 1;
  return Math.min(MAX_BEATS, closestBeat);
}

export default function GifEditor({ url, onClose }) {
  const [isSync, setSync] = useState(true);
  const [previewFrame, setPreviewFrame] = useState(undefined);
  const [frames, setFrames] = useState([]);
  const { meta, setMeta } = useSharedState();
  const { offset = 0, beats = 1 } = meta[url] || {};
  const isOnBeat = useBeat();
  const maxBeats = useRef(1);
  
  useEffect(() => {
    (async () => {
      const gifFrames = await getGifFrames(url);
      setFrames(gifFrames);
      maxBeats.current = getMeaxBeats(gifFrames.length);
    })()
  }, [])
  
  if(frames.length === 0) return null;

  function nextBeats() {
    let nextBeats = beats << 1;
    if(nextBeats > maxBeats.current) nextBeats = 1;
    setMeta(url, { beats: nextBeats })
  }
  
  function getSpeed() {
    return Math.pow(2, Math.log2(maxBeats.current) - Math.log2(beats));
  }
  
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '530px',
        height: 'calc(100vh - 56px)',
        background: '#000',
      }}
    >
      <GifPlayer
        onFrameChange={setPreviewFrame}
        previewFrame={isSync ? undefined : previewFrame}
        style={{
          width: '300px',
          height: '300px',
        }}
        url={url}
        meta={{ offset, beats }}
      />
      <div
        style={{
          width: '100%',
          marginTop: '48px',
        }}
      >
        {isSync && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              height: '50px',
              flex: '0 0 auto',
              fontFamily: 'monospace',
              fontSize: '48px',
              opacity: isOnBeat ? 1 : 0,
              transition: !isOnBeat && 'opacity 0.3s',
            }}
          >
            👏
          </div>
        )}
        {!isSync && (
          <Frames
            frames={frames}
            offset={offset}
            beats={beats}
            previewFrame={previewFrame}
            onOffsetChange={newOffset => setMeta(url, { offset: newOffset })}
            onPreviewFrameChange={setPreviewFrame}
          />
        )}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          marginTop: '48px',
          justifyContent: 'space-evenly',
          userSelect: 'none',
        }}
      >
        <div
          onClick={nextBeats}
          style={{
            color: '#fff',
            fontSize: '36px',
            fontFamily: 'monospace',
            cursor: 'pointer',
          }}
        >
          {`${getSpeed()}x`}
        </div>
        <div
          onClick={() => setSync(!isSync)}
          style={{
            color: '#fff',
            fontSize: '36px',
            fontFamily: 'monospace',
            cursor: 'pointer',
          }}
        >
          {isSync ? '||' : '>'}
        </div>
        <div
          onClick={onClose}
          style={{
            color: '#fff',
            fontSize: '36px',
            fontFamily: 'monospace',
            cursor: 'pointer',
          }}
        >
          x
        </div>
      </div>
    </div>
  )
}