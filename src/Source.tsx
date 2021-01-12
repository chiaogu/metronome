import { h } from 'preact';
import { useState } from 'preact/hooks';
import SpotifyPlayer from './SpotifyPlayer';
import Metronome from './Metronome';
import useSharedState from './useSharedState';

export default function Source() {
  const { isSpotify, setSpotify } = useSharedState();
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
    }}>
      <button onClick={() => setSpotify(!isSpotify)}>
        {isSpotify ? 'Spotify' : 'Metronome'}
      </button>
      {isSpotify && <SpotifyPlayer/>}
      {!isSpotify && <Metronome/>}
    </div>
  )
}