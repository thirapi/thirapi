import { getNowPlaying } from '@/lib/spotify';

export default async function handler(req, res) {
  const response = await getNowPlaying();

  if (response.status >= 500) {
    const errorBody = await response.json();
    return res.status(500).json({ error: errorBody.error || 'Internal Server Error' });
  }

  if (response.status === 204 || response.status > 400) {
    return res.status(200).json({ isPlaying: false });
  }

  const song = await response.json();

  if (song.item === null) {
    return res.status(200).json({ isPlaying: false });
  }

  const data = {
    isPlaying: song.is_playing,
    title: song.item.name,
    artist: song.item.artists.map((_artist) => _artist.name).join(', '),
    album: song.item.album.name,
    albumImageUrl: song.item.album.images[0].url,
    songUrl: song.item.external_urls.spotify,
    progress: song.progress_ms,
    duration: song.item.duration_ms,
  };

  res.setHeader(
    'Cache-Control',
    'public, s-maxage=60, stale-while-revalidate=30'
  );

  return res.status(200).json(data);
}
