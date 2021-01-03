export type Track = {
  id: string;
  name: string;
  progress: number;
  duration: number;
  albumName: string;
  albumCoverUrl: string;
  isPlaying: boolean;
} | null;

async function request(endpoint) {
  const TOKEN = 'BQA9xpXNq7VF5ml_R5bBhDTcwEz5XXk4kq8H5UA5dZLekg6CB-PPFC_zeFAhvZkuERKFJmJaGBNnz7j9raXbMJKVyPQhVqNNCDPyrtR0ObhL8AZW8H8Qv-df1Jg-9e4T_szIR00Xuyw2bterI_PjV1me';
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