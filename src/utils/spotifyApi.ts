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

export const TOKEN = 'BQAHvNTQb462QHdxDo8rW3z2jijrYc8X2dDlWOCoAQlBoSyemJkxQciYZ7To9HdhooTmgUGo07-w-ZR58mFCVdkZ_OifLOQ5kQ9yWFASwspI4kdggUM1VJYbuWjCz9MJ4vM1NnUs2gAqqmLVT_x0rDMowo9Dmza6jjkLpuwP';

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