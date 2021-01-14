export type Track = {
  id: string;
  name: string;
  progress: number;
  duration: number;
  albumName: string;
  albumCoverUrl: string;
  isPlaying: boolean;
  type: string;
} | null;

export const TOKEN = 'BQAk59pBrSpId8I7qrKg4I0IJxRz3ep-UarCsrvpVsXFXNMGWit8bGdusBd_ZemUbfwaWcTdD-dPDl1nnlGxgkm1kc1A1dnwX9JhddlumKsF8hyois6IYgkaAZ0FCC3hr1851GSzq2JCgZSUKNnDt2lS8J340VBP0nI6ZVwx';

async function request(endpoint) {
  const res = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });
  if(res.status === 204) return null;
  const { error, ...rest } = await res.json();
  if(error) throw new Error(error.message);
  return rest;
}

export async function getTrackAnalysis(id) {
  const result = await request(`audio-analysis/${id}`);
  // console.log(result)
  return result;
}

export async function getCurrentPlayback(): Promise<Track> {
  const res = await request('me/player');
  if(res === null) throw new Error('Not listening on Spotify');
  const { item, progress_ms, is_playing, currently_playing_type } = res;
  return {
    id: item?.id,
    name: item?.name,
    duration: item?.duration_ms,
    albumName: item?.album.name,
    albumCoverUrl: item?.album.images[0].url,
    progress: progress_ms,
    type: currently_playing_type,
    isPlaying: is_playing,
  }
}