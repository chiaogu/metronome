export type Track = {
  id: string;
  name: string;
  progress: number;
  duration: number;
  albumName: string;
  albumCoverUrl: string;
  isPlaying: boolean;
} | null;

export const TOKEN = 'BQCTUINfxDp9_h-tOLffma_LRLFGUAZtubqkaL_hARasjYJL-RMxdnT35hblQS1dANvfdZ-daZOOKROD7lpfSG_cF98Rh2EVnIdE4UKwi-K1V3s45QHqUX26T_4AkLrTrydB9XiFn-C2z2Wa0RZuZl5_SU9BEMIpuTt5izD6';

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
  // console.log(result)
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