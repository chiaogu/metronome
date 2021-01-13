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

export const TOKEN = 'BQBAOB60iNadFpaYsxvu93p2O7n756Mbwp8BjXm-GazEcurnuYZeiqmZBl3PzyL0YH9tJwgSYRzlZvGvw7uumhC7hi5IWVRGYQlbzr0t1muFdvu9H4K5tNeMGNiGKOrQ_rJifUwv5W7gJtCikwMsqGgkPsQo5hX9WTcFXuPK';

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