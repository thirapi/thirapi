import { getNowPlaying } from '@/lib/spotify';

const generateSvgDvd = async (data) => {
    const { title, artist, albumImageUrl, isPlaying, error } = data;

    const spotifyIcon = `
        <svg role="img" width="20" height="20" viewBox="0 0 24 24" fill="#1DB954" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.19 14.32c-.2.25-.58.32-.83.12-.25-.2-.32-.58-.12-.83.19-.25.58-.32.83-.12.25.2.32.58.12.83zm.64-1.68c-.25.3-.7.39-1.01.14-.3-.25-.39-.7-.14-1.01.25-.3.7-.39 1.01-.14.3.25.39.7.14 1.01zM18.78 12.5c-.3.36-1.01.5-1.5.21-.48-.28-.62-.9-.32-1.26.3-.36 1.01-.5 1.5-.21.49.29.63.9.32 1.26z"/>
        </svg>`;

    const notPlayingOrErrorHtml = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; height: 100%; color: #9CA3AF;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                ${spotifyIcon}
                <span style="font-size: 1rem; font-weight: 600; color: #D1D5DB;">Spotify</span>
            </div>
            <p style="font-size: 0.875rem; margin-top: 0.5rem;">${error || 'Not currently playing a track.'}</p>
        </div>
    `;

    let mainContent;
    if (isPlaying) {
        const imageResponse = await fetch(albumImageUrl);
        const imageBuffer = await imageResponse.arrayBuffer();
        const imageBase64 = Buffer.from(imageBuffer).toString('base64');
        const imageSrc = `data:${imageResponse.headers.get('content-type')};base64,${imageBase64}`;

        mainContent = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2rem; width: 100%;">
                <!-- DVD Player -->
                <div style="position: relative; width: 320px; height: 320px; display: flex; align-items: center; justify-content: center;">
                    <div style="position: absolute; inset: 0; border-radius: 9999px; background-image: linear-gradient(to bottom right, #1F2937, #111827, #000000); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); border: 8px solid #374151;"></div>
                    <div class="${isPlaying ? 'animate-spin-slow' : ''}" style="position: relative; width: 288px; height: 288px; border-radius: 9999px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);">
                        <img src="${imageSrc}" alt="${title}" style="width: 100%; height: 100%; object-fit: cover;" />
                    </div>
                    <div style="position: absolute; width: 48px; height: 48px; border-radius: 9999px; background-image: linear-gradient(to bottom right, #4B5563, #111827); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); border: 2px solid #6B7280; z-index: 10;"></div>
                    <div style="position: absolute; width: 32px; height: 32px; border-radius: 9999px; background-image: linear-gradient(to bottom right, #374151, #1F2937); z-index: 10;"></div>
                </div>

                <!-- Track Details -->
                <div style="text-align: center; max-width: 448px;">
                    <h2 style="font-size: 1.5rem; font-weight: 700; color: #FFFFFF; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${title}</h2>
                    <p style="font-size: 1.125rem; color: #D1D5DB; margin-top: 0.5rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${artist}</p>
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
        background-color: #000000;
        padding: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
    `;

    return `
        <svg width="600" height="500" fill="none" xmlns="http://www.w3.org/2000/svg">
            <foreignObject width="600" height="500" style="overflow: visible;">
                <style>
                    @keyframes spin-slow {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    .animate-spin-slow {
                        animation: spin-slow 30s linear infinite;
                    }
                </style>
                <div xmlns="http://www.w3.org/1999/xhtml" style="${mainContainerStyle}">
                    ${mainContent}
                </div>
            </foreignObject>
        </svg>
    `;
};

export default async function handler(req, res) {
    const response = await getNowPlaying();

    if (response.status === 204 || response.status > 400) {
        const svg = await generateSvgDvd({ isPlaying: false });
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
        return res.status(200).send(svg);
    }

    let song;
    try {
        song = await response.json();
    } catch (e) {
        const svg = await generateSvgDvd({ isPlaying: false, error: 'Error parsing Spotify data.' });
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
        return res.status(200).send(svg);
    }

    if (song === null || song.item === null) {
        const svg = await generateSvgDvd({ isPlaying: false });
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
        return res.status(200).send(svg);
    }

    const data = {
        isPlaying: song.is_playing,
        title: song.item.name,
        artist: song.item.artists.map((artist) => artist.name).join(', '),
        albumImageUrl: song.item.album.images[0]?.url,
    };
    
    const svg = await generateSvgDvd(data);
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
    return res.status(200).send(svg);
}
