import { h } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
import { GIF_META } from '../constants';
import GifPlayer from '../GifPlayer';
import useBeat from '../useBeat';
import useSharedState from '../useSharedState';
import { getGifFrames } from '../utils/gif';
import Frames from './Frames';

const url = 'https://media.giphy.com/media/6mr2y6RGPcEU0/giphy.gif';

export default function GifEditor({ }: { url? }) {
  const [isSync, setSync] = useState(true);
  const [previewFrame, setPreviewFrame] = useState(undefined);
  const [frames, setFrames] = useState([]);
  const { meta, setMeta } = useSharedState();
  const { offset, beats } = meta[url];
  const isOnBeat = useBeat();
  
  useEffect(() => {
    (async () => {
      setFrames(await getGifFrames(url));
    })()
  }, [])
  
  if(frames.length === 0) return null;

  function nextBeats() {
    const maxBeats = Math.min(16, frames.length / 8);
    let nextBeats = beats << 1;
    if(nextBeats > maxBeats) nextBeats = 1;
    setMeta(url, { beats: nextBeats })
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
          {`👏 x${beats}`}
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
      </div>
    </div>
  )
}