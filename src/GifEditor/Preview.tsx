import { h } from 'preact';
import useBeat from '../useBeat';
import useSharedState from '../useSharedState';

export default function GifEditor({ url }: { url? }) {
  const isOnBeat = useBeat();
  const { bpm } = useSharedState();
  
  return (
    <div
    >
    </div>
  )
}