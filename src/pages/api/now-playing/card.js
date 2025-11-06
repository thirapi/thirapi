import { getNowPlaying } from '@/lib/spotify';

const getBase64Image = async (url) => {
  if (!url) return '';
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mime = response.headers.get('content-type');
    return `data:${mime};base64,${base64}`;
  } catch (e) {
    console.error("Error fetching image:", e);
    return ''; // Return empty string if image fails
  }
};

const escapeXml = (unsafe) => {
    if (!unsafe) return '';
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case "\'": return '&apos;';
            case '"': return '&quot;';
        }
    });
};

const generateSvg = async (data) => {
    const { title, artist, album, albumImageUrl, isPlaying, error } = data;

    const spotifyIcon = `
        <svg role="img" width="20" height="20" viewBox="0 0 24 24" fill="#1DB954" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.19 14.32c-.2.25-.58.32-.83.12-.25-.2-.32-.58-.12-.83.19-.25.58-.32.83-.12.25.2.32.58.12.83zm.64-1.68c-.25.3-.7.39-1.01.14-.3-.25-.39-.7-.14-1.01.25-.3.7-.39 1.01-.14.3.25.39.7.14 1.01zM18.78 12.5c-.3.36-1.01.5-1.5.21-.48-.28-.62-.9-.32-1.26.3-.36 1.01-.5 1.5-.21.49.29.63.9.32 1.26z"/>
        </svg>`;

    const notPlayingOrErrorHtml = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.75rem; text-align: center; color: ${error ? '#F87171' : '#D1D5DB'};">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                ${spotifyIcon.replace('#1DB954', error ? '#F87171' : '#1DB954')}
                <span style="font-size: 0.875rem; font-weight: 600;">Spotify</span>
            </div>
            <p style="font-size: ${error ? '0.75rem' : '0.875rem'}; margin: 0;">${error ? escapeXml(error) : 'No track is currently playing.'}</p>
        </div>
    `;

    let mainContent;
    if (isPlaying) {
        const imageBase64 = await getBase64Image(albumImageUrl);
        mainContent = `
            <div style="display: flex; flex-direction: column; gap: 1rem; height: 100%; justify-content: space-between;">
                <div style="display: flex; gap: 1rem;">
                    <img src="${imageBase64}" alt="${escapeXml(album)}" style="width: 96px; height: 96px; border-radius: 0.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1); object-fit: cover; border: 1px solid rgba(107, 114, 128, 0.5);" />
                    <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between; min-width: 0;">
                         <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            <p style="font-size: 1rem; font-weight: 700; color: white; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeXml(title)}</p>
                            <p style="font-size: 0.875rem; color: #D1D5DB; margin: 0.2rem 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeXml(artist)}</p>
                        </div>
                        <p style="font-size: 0.75rem; color: #9CA3AF; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeXml(album)}</p>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.375rem; padding-top: 0.5rem; border-top: 1px solid rgba(107, 114, 128, 0.5);">
                    ${spotifyIcon.replace('width="20" height="20"', 'width="14" height="14"')}
                    <span style="font-size: 0.75rem; color: #9CA3AF;">Now Playing on Spotify</span>
                </div>
            </div>
        `;
    } else {
        mainContent = notPlayingOrErrorHtml;
    }
    
    const mainContainerStyle = `
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
      width: 100%; 
      height: 100%; 
      overflow: visible; 
      background-image: linear-gradient(to bottom right, #030712, #111827, #000000); 
      padding: 1.5rem; 
      border-radius: 0.75rem; 
      border: 1px solid rgba(107, 114, 128, 0.5); 
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
      box-sizing: border-box;
      ${!isPlaying ? `display: flex; align-items: center; justify-content: center;` : ''}
    `;

    return `
        <svg width="400" height="185" fill="none" xmlns="http://www.w3.org/2000/svg">
            <foreignObject width="400" height="185" style="overflow: visible;">
                <div xmlns="http://www.w3.org/1999/xhtml" style="${mainContainerStyle}">
                    ${mainContent}
                </div>
            </foreignObject>
        </svg>
    `;
};


export default async function handler(req, res) {
  let response;
  try {
    response = await getNowPlaying();
  } catch (e) {
    const svg = await generateSvg({ isPlaying: false, error: 'Could not connect to Spotify API.' });
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.status(500).send(svg);
  }
  
  if (response.status >= 500) {
    const errorBody = await response.json();
    const svg = await generateSvg({ isPlaying: false, error: errorBody.error || 'Internal Server Error' });
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30');
    return res.status(200).send(svg);
  }

  if (response.status === 204 || response.status > 400) {
    const svg = await generateSvg({ isPlaying: false });
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30');
    return res.status(200).send(svg);
  }

  const song = await response.json();

  if (song.item === null || !song.is_playing) {
    const svg = await generateSvg({ isPlaying: false });
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30');
    return res.status(200).send(svg);
  }

  const svg = await generateSvg({
    isPlaying: song.is_playing,
    title: song.item.name,
    artist: song.item.artists.map((a) => a.name).join(', '),
    album: song.item.album.name,
    albumImageUrl: song.item.album.images[0]?.url,
  });

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30');
  res.status(200).send(svg);
}
