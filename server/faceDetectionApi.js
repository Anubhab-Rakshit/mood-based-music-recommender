// server/faceDetectionApi.js
const vision = require("@google-cloud/vision");
require("dotenv").config();
console.log("GOOGLE_APPLICATION_CREDENTIALS:", process.env.GOOGLE_APPLICATION_CREDENTIALS);
const client = new vision.ImageAnnotatorClient();

/**
 * Maps Google Vision API emotions to moods.
 */
const mapEmotionsToMood = (emotionData) => {
  let mood = "Neutral & Calm 😌"; // Default Mood

  if (emotionData.joy === "VERY_LIKELY") {
    mood = "Happy & Energetic 🎉";
  } else if (emotionData.sorrow === "VERY_LIKELY") {
    mood = "Sad & Melancholic 😢";
  } else if (emotionData.anger === "VERY_LIKELY") {
    mood = "Frustrated & Stressed 😤";
  } else if (emotionData.surprise === "VERY_LIKELY") {
    mood = "Curious & Amazed 🤩";
  }

  return mood;
};

/**
 * Detect mood from a Base64 image.
 */
const detectMoodFromImage = async (base64Image) => {
  try {
    if (!base64Image) throw new Error("No image provided!");
    
    // Ensure base64 data is properly formatted
    console.log('Base64 Image Length:', base64Image.length);  // Debugging step
    if (!base64Image.startsWith("data:image")) {
      throw new Error("Invalid Base64 image format.");
    }

    const request = { image: { content: base64Image.split(',')[1] } };  // Remove base64 header

    const [result] = await client.faceDetection(request);
    const faces = result.faceAnnotations;

    if (!faces || faces.length === 0) {
      return { mood: "No Face Detected ❌" };  // Return when no faces detected
    }

    const detectedEmotions = {
      joy: faces[0].joyLikelihood,
      sorrow: faces[0].sorrowLikelihood,
      anger: faces[0].angerLikelihood,
      surprise: faces[0].surpriseLikelihood
    };

    return { mood: mapEmotionsToMood(detectedEmotions), detectedEmotions };  // Return mood

  } catch (error) {
    console.error("Google Vision API Error:", error);
    return { mood: "Error Processing Image ❌" };  // Return error if anything goes wrong
  }
};

module.exports = { detectMoodFromImage };
