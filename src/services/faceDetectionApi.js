// services/faceDetectionApi.js
export const detectMoodFromImage = async (imageData) => {
    try {
      const response = await fetch("http://localhost:5000/detect-mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData }), // Sending image data
      });
  
      return await response.json(); // Expecting response in JSON format
    } catch (error) {
      console.error("Error detecting mood:", error);
      return { mood: "Error ❌" }; // Error handling
    }
  };
  