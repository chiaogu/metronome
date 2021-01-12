import { h } from 'preact';
import { useState } from 'preact/hooks';
import Bpm from './Bpm';
import Source from './Source';

export default function BottomBar() {
  const [isOpened, setOpened] = useState(false);
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Bpm onClick={() => setOpened(!isOpened)}/>
      {isOpened && <Source/>}
    </div>
  )
}