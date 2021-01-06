export type Track = {
  id: string;
  name: string;
  progress: number;
  duration: number;
  albumName: string;
  albumCoverUrl: string;
  isPlaying: boolean;
} | null;

export const TOKEN = 'BQCBkmaadJalTdnTL9y6H9m8S8Mpf9wuBkaYBIePJ4HOFhJsM9DwHMWP4PCykkcT3OWMf7d_6aEkRbyEAHss4EkGQNYBr7EFq9Oz9aXeeiy-UsVobBhkbhLvYNw7PjaYUljHUuFlsXhlCcXPaw0csAWYMRr1dvufbRWpFg5H';

async function request(endpoint) {
  const { error, ...rest } = await (await fetch(`https://api.spotify.com/v1/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  })).json();
  if(error) throw new Error(error.message);
  return rest;
}

export async function getTrackAnalysis(id) {
  const result = await request(`audio-analysis/${id}`);
  console.log(result)
  return result;
}

export async function getCurrentPlayback(): Promise<Track> {
  const { item: { id, name, duration_ms, album }, progress_ms, is_playing } = await request('me/player');
  return {
    id,
    name,
    duration: duration_ms,
    progress: progress_ms,
    albumName: album.name,
    albumCoverUrl: album.images[0].url,
    isPlaying: is_playing,
  }
}