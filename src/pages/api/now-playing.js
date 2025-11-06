import axios from 'axios';

let accessToken = '';
let expiresIn = 3600; 
const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

const updateAccessToken = async () => {
  try {
    const response = await axios.post('https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    accessToken = response.data.access_token;
    expiresIn = response.data.expires_in;
  } catch (error) {
    console.error('Error refreshing access token:', error.response ? error.response.data : error.message);
  }
};

const fetchNowPlaying = async () => {
  try {
    const response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.data && response.data.is_playing) {
      return {
        track: response.data.item,
        progress: response.data.progress_ms,
        duration: response.data.item.duration_ms,
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching currently playing track:', error.response ? error.response.data : error.message);
    return null;
  }
};

const convertImageToBase64 = async (imageUrl) => {
  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBase64 = Buffer.from(response.data, 'binary').toString('base64');
    return `data:image/jpeg;base64,${imageBase64}`;
  } catch (error) {
    console.error('Error converting image to base64:', error.message);
    return null;
  }
};

export default async function handler(req, res) {
  if (!accessToken || expiresIn < 60) {
    await updateAccessToken();
  }

  const nowPlaying = await fetchNowPlaying();
  res.setHeader('Content-Type', 'image/svg+xml');

  const track = nowPlaying ? nowPlaying.track : 
  { name: "No track is currently playing", 
    external_urls: { spotify: "external url" },
    artists: [
      { 
        name: "hello world",
        external_urls:
          { 
            spotify: "url-artist" 
          }
      }],
    album: 
      { 
        name: "-",
        external_urls: {
          spotify: '/url-album'
        },
        images: [
          { 
            url: "https://raw.githubusercontent.com/Thirapi/Thirapi/refs/heads/main/public/bg.gif" 
          }
        ] 
      }, 
    };

  const imageUrl = track.album.images[0].url;

  const imageBase64 = await convertImageToBase64(imageUrl);

  if (!imageBase64) {
    res.status(200).send(`
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="100">
        <text x="10" y="50" font-size="16" fill="white">Error loading album image</text>
      </svg>
    `);
    return;
  }

  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="420" height="240">
      <foreignObject x="10" y="10" width="420" height="240">
        <style>
          .now-playing-container {
            position: relative;
            background-color:rgba(46, 47, 52, 0.37);
            border-radius: 10px;
            padding: 0 15px 10px 15px;
            width: 100%;
            max-width: 340px;
            font-family: Arial, sans-serif;
            color: white;
            display: flex;
            justify-content: center;
            flex-direction: column;
            margin: 0 auto;
            margin-bottom: 10px;
            overflow: hidden;
          }
          .now-playing-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: url('${imageBase64}');
            background-repeat: no-repeat;
            background-size: cover;
            background-position: center;
            filter: blur(10px); 
            z-index: -1;
          }

          .now-playing h4 {
            color: #a9a9a9;
            font-size: 12px;
            margin-bottom: 10px;
          }

          .track-info {
            display: flex;
            flex-direction: row;
            margin-bottom: 10px;
            margin-top: 15px;
          }

          .album-art {
            height: 80px;
            width: 80px;
            border-radius: 8px;
            margin-right: 15px;
            transition: transform 0.3s ease;
          }

          .album-art:hover {
            height: 80px;
            width: 80px;
            border-radius: 8px;
            margin-right: 15px;
            transform: scale(1.1);
          }

          a {
            text-decoration: none;
          }

          .track-details {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
          }

          .track-details .track-name {
            margin: 0 0 5px 0;
            color: #fff;
            font-size: 16px;  
            font-weight: 900;
            transition: background-color 0.5s ease, color 0.3s ease;
          }

          .track-details .track-name:hover {
            margin: 0 0 5px 0;
            background-color:rgba(0, 0, 0, 0.25);
            color: #fff;
            font-size: 16px;  
            font-weight: 900;
          }

          .track-details .track-artist-album {
            margin: 5px 0;
            font-size: 14px;
            color:rgb(201, 201, 201);
            transition: background-color 0.5s ease, color 0.3s ease;
          }

          .track-details .track-artist-album:hover {
            margin: 5px 0;
            background-color:rgba(0, 0, 0, 0.25);
            font-size: 14px;
            color:rgb(201, 201, 201);
          }

          .time-progress-container {
            width: 100%;
            height: 10px;
            position: absolute;
            bottom: 0;
            left: 3px;
          }

          .progress-bar {
            height: 100%;
            display: inline-block;
            position: relative;
          }

          .time-progress-container .progress-bar>div {
            position: relative;
            height: 100%;
            width: 5px;
            background-color: #540D6E;
            display: inline-block;
            animation: wave 3s infinite ease-in-out;
            -webkit-animation: wave 3s infinite ease-in-out;
          }

          .time-progress-container .progress-bar .bar2 {
            animation-delay: 0.2s;
            -webkit-animation-delay: 0.2s;
          }

          .time-progress-container .progress-bar .bar3 {
            animation-delay: 0.2s;
            -webkit-animation-delay: 0.2s;
          }

         .time-progress-container .progress-bar .bar4 {
            animation-delay: 0.3s;
            -webkit-animation-delay: 0.3s;
          }

         .time-progress-container .progress-bar .bar5 {
            animation-delay: 0.4s;
            -webkit-animation-delay: 0.4s;
          }

         .time-progress-container .progress-bar .bar6 {
            animation-delay: 0.5s;
            -webkit-animation-delay: 0.5s;
          }

          @keyframes wave {
          0%,
          100% {
            transform: scaleY(1);
            background-color:#7DDF64;
          }
          16.67% {
            transform: scaleY(3);
            background-color:#B0228C;
          }
          33.33% {
            transform: scaleY(1);
            background-color:#FF514F;
          }
          50% {
            transform: scaleY(3);
            background-color: #FF8C42;
          }
          66.67% {
            transform: scaleY(1);
            background-color: #008DD5;
          }
          83.34% {
            transform: scaleY(3);
            background-color:#008DD5;
          }
            
        </style>
        <div xmlns="http://www.w3.org/1999/xhtml" class="now-playing-container">
          <div class="track-info">
            <a href="${track.external_urls.spotify}" target="_blank" rel="noopener noreferrer">
              <img src="${imageBase64}" alt="${track.name}" class="album-art" />
            </a>
            <div class="track-details">
            <a href="${track.external_urls.spotify}" target="_blank" rel="noopener noreferrer">
              <div class="track-name">${track.name}</div>
            </a>
            <a href="${track.artists[0].external_urls.spotify}" target="_blank" rel="noopener noreferrer">
              <div class="track-artist-album">${track.artists.map(artist => artist.name).join(', ')}</div>
            </a>
            <a href="${track.album.external_urls.spotify}" target="_blank" rel="noopener noreferrer">
              <div class="track-artist-album">${track.album.name}</div>
            </a>
            </div>
          </div>
          <div class="time-progress-container">
            <div class="progress-bar">
              ${Array.from({ length: 39 }, (_, i) => `<div class='bar${Math.floor(Math.random() * 6) + 1}'></div>`).join(' ')}
            </div>
          </div>
        </div>
      </foreignObject>
    </svg>
  `;

  res.status(200).send(svgContent);
}

