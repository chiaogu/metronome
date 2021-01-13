import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { GIF_META } from '../constants';
import GifPlayer from '../GifPlayer';
import useBeat from '../useBeat';
import useSharedState from '../useSharedState';
import { getGifFrames } from '../utils/gif';
import Frames from './Frames';

const url = 'https://media.giphy.com/media/6mr2y6RGPcEU0/giphy.gif';

export default function GifEditor({ }: { url? }) {
  const [previewFrame, setPreviewFrame] = useState(undefined);
  const [frames, setFrames] = useState([]);
  const { meta, setMeta } = useSharedState();
  const { offset, beats } = meta[url];
  
  useEffect(() => {
    (async () => {
      setFrames(await getGifFrames(url));
    })()
  }, [])
  
  if(frames.length === 0) null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '500px',
        height: 'calc(100vh - 56px)',
        background: '#000',
      }}
    >
      <GifPlayer
        previewFrame={previewFrame}
        style={{
          width: '300px',
          height: '300px',
        }}
        url={url}
        meta={{ offset, beats }}
      />
      <Frames
        frames={frames}
        offset={offset}
        beats={beats}
        previewFrame={previewFrame}
        onOffsetChange={newOffset => setMeta(url, { offset: newOffset })}
      />
    </div>
  )
}