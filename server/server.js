// server/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { detectMoodFromImage } = require('./faceDetectionApi');
const { spotifyApi, refreshAccessToken } = require('../src/services/spotifyService');  // Corrected import


const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// Route to detect mood from image
// server.js


app.post('/detect-mood', async (req, res) => {
    try {
      const { image } = req.body;  // Retrieve image data from request
     
  
      const { mood } = await detectMoodFromImage(image);  // Call the mood detection function
  
      if (!mood) {
        return res.status(400).json({ error: "Mood detection failed" });
      }
  
      res.json({ mood });  // Return the detected mood to client
    } catch (error) {
      console.error('Error detecting mood:', error);
      res.status(500).json({ error: 'Failed to detect mood' });
    }
  });
  
  

// Route to get Spotify recommendations based on mood
app.get('/recommendations/:mood', async (req, res) => {
  try {
    const { mood } = req.params;
    const recommendations = await getSpotifyRecommendations(mood);
    res.json(recommendations);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Function to get Spotify recommendations based on mood
async function getSpotifyRecommendations(mood) {
  const moodMap = {
    'Happy': { q: 'happy upbeat', limit: 20 },
    'Sad': { q: 'sad melancholic', limit: 20 },
    'Energetic': { q: 'energetic upbeat', limit: 20 },
    'Relaxed': { q: 'chill relaxing', limit: 20 }
  };

  const params = moodMap[mood] || moodMap['Happy'];

  try {
    await refreshAccessToken();  // Ensure access token is refreshed

    // Correct usage of spotifyApi to call the Spotify API
    const data = await spotifyApi.searchTracks(params.q, { limit: params.limit });

    const tracks = data.body.tracks.items.map(track => ({
      name: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      preview_url: track.preview_url
    }));

    // Shuffle the tracks to get a random selection
    return shuffleArray(tracks).slice(0, 20);
  } catch (error) {
    console.error('Error getting Spotify recommendations:', error);
    throw error;
  }
}

// Helper function to shuffle an array (to randomize track order)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
