// services/spotifyService.js
const SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

async function refreshAccessToken() {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body['access_token']);
    console.log('Access token refreshed successfully');
  } catch (error) {
    console.error('Error refreshing access token:', error);
  }
}

// Refresh token immediately when the service starts
refreshAccessToken();

// Refresh token every 50 minutes
setInterval(refreshAccessToken, 50 * 60 * 1000);

module.exports = { spotifyApi, refreshAccessToken };
