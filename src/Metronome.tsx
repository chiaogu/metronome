import { h } from 'preact';
import * as Timer from './utils/timer';
import useSharedState from './useSharedState';

export default function Metronome() {
  const { bpm, setBpm } = useSharedState();
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
    }}>
      <input
        type='range'
        value={bpm}
        min={1}
        max={400}
        onInput={({ target: { value }}) => {
          setBpm(value);
          Timer.setToneBpm(bpm);
        }}
      />
    </div>
  )
}