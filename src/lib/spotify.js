const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;

const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`;

const getAccessToken = async () => {
  // Throw an error if credentials are not available
  if (!client_id || !client_secret || !refresh_token) {
    throw new Error('SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, or SPOTIFY_REFRESH_TOKEN is not set in environment variables.');
  }

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Error fetching Spotify access token:', data);
    throw new Error(data.error_description || 'Failed to fetch access token from Spotify.');
  }

  return data;
};

export const getNowPlaying = async () => {
  try {
    const { access_token } = await getAccessToken();

    if (!access_token) {
      throw new Error("Access Token not found in Spotify's response.");
    }

    return fetch(NOW_PLAYING_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
  } catch (error) {
    // Log the detailed error on the server
    console.error('[getNowPlaying error]:', error.message);
    // Return a response object that indicates an internal server error
    const failedResponse = new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
    return Promise.resolve(failedResponse);
  }
};
