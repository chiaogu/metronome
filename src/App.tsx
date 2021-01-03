import { useEffect, useState } from 'preact/hooks';
import style from './style';

type Track = {
  name: string;
  duration: number;
  albumName: string;
  albumCoverUrl: string;
} | null;

const TOKEN = 'BQBp8w2aU7OiTWoiPxLjOOVf9MIu8cK5ogZrtIYETI2F9VCvQVoz5-A02BopE7XTsjyUyDrkBEsqi_KF_kWx8CN8ndYD471zHCQwuuBwfBlUyzrq7ZQ5wJ8aXWDQQFwm74QekquShBCuAM_tdosViVjM';

async function getTrackAnalysis() {
  
}

async function getCurrentPlayback(): Promise<Track> {
  const { item, error } = await (await fetch('https://api.spotify.com/v1/me/player', {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  })).json();
  if(error) throw new Error(error.message);
  return {
    name: item.name,
    duration: item.duration_ms,
    albumName: item.album.name,
    albumCoverUrl: item.album.images[0].url,
  }
}

const AlbumCover = style('img')({
  width: '200px',
  height: '200px',
});

export default function App() {
  const [track, setTrack] = useState<Track>(null);
  const [error, setError] = useState<Error>(null);
  
  useEffect(() => {
    getCurrentPlayback().then(setTrack).catch(setError);
    // const intervalId = setInterval(() => {
    //   getCurrentPlayback();
    // }, 5000);
    // return () => clearInterval(intervalId);
  }, []);
  
  if(error) {
    return (
      <div>{error.message}</div>
    )
  }
  
  if(track) {
    return (
      <>
        <div>{track.name}</div>
        <div>{track.albumName}</div>
        <AlbumCover src={track.albumCoverUrl}/>
      </>
    )
  }
}