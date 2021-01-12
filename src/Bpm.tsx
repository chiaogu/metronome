import { h } from 'preact';
import useBeat from './useBeat';
import useSharedState from './useSharedState';

export default function Bpm({ onClick }) {
  const isOnBeat = useBeat();
  const { bpm } = useSharedState();
  
  return (
    <h1
      onClick={onClick}
      style={{
        margin: '32px auto',
        width: 'fit-content',
        transform: isOnBeat ? 'scale(2)': 'scale(1)',
        transition: !isOnBeat && 'transform 0.3s',
        transitionOrigin: '50% 50%',
      }}
    >{bpm}</h1>
  )
}