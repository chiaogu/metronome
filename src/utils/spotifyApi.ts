export type Track = {
  id: string;
  name: string;
  progress: number;
  duration: number;
  albumName: string;
  albumCoverUrl: string;
  isPlaying: boolean;
} | null;

export const TOKEN = 'BQD4klgUsjH7ToYo5sbbfgruQUp-zHc_LAvSjPB0lsS2e5Yu-uov6s2nlqrWEUoCHfkR82e0vM60Z_hoLpnpopqPpeQgOVAVpf-8ESptz91gVF7Qo1gQg2IiuoFfnHnhjVItc8zN6rY3a-Vgc74eYpeNXzcHliREALrgSnLc';

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