import React, { useState, useRef, useEffect } from "react";
import { detectMoodFromImage } from "../services/faceDetectionApi";
import "../styles/ImageCapture.css";
import SpotifyRecommendations from './SpotifyRecommendations';
import { FileMusicIcon as MusicNote, Camera, Upload, CircleStopIcon as Stop, Smile } from 'lucide-react';

function ImageCapture({ onMoodDetected }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isPhotoCaptured, setIsPhotoCaptured] = useState(false);
  const [mood, setMood] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // ✅ FIX: Image Upload works correctly
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Create a FileReader to read the file as Base64
      const reader = new FileReader();

      reader.onloadend = () => {
        // Set the Base64 string as the selected image
        setSelectedImage(reader.result);
        setMood(null);  // Clear previous mood
        stopCamera();   // Stop the webcam if an image is uploaded
      };

      // Read the file as a Base64 encoded string
      reader.readAsDataURL(file);
    }
  };

  // Add a state to track if the component is fully mounted
const [isMounted, setIsMounted] = useState(false);

// Update the useEffect to properly handle mounting
useEffect(() => {
  // Set mounted flag after component is rendered
  setIsMounted(true);
  
  // Clean up function for unmounting
  return () => {
    setIsMounted(false);
    stopCamera();
  };
}, []);

// Add a second useEffect that depends on the mounted state
useEffect(() => {
  // Only try to start camera when component is fully mounted
  if (isMounted) {
    // Give a bit more time for the DOM to be ready
    const timer = setTimeout(() => {
      startCamera();
    }, 1000);
    
    return () => clearTimeout(timer);
  }
}, [isMounted]);

// Update the startCamera function
const startCamera = async () => {
  // First check if component is still mounted
  if (!isMounted) {
    console.log("Component not mounted, canceling camera start");
    return;
  }
  
  try {
    // Stop any existing stream first
    stopCamera();
    
    // Check if video element exists
    if (!videoRef.current) {
      console.error("❌ Video element not available - ensure video element is rendered properly");
      return;
    }
    
    console.log("Attempting to access webcam...");
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    
    // Check again if we're still mounted and video exists after async call
    if (!isMounted || !videoRef.current) {
      console.log("Component state changed during camera setup - cleaning up");
      stream.getTracks().forEach(track => track.stop());
      return;
    }
    
    streamRef.current = stream;
    videoRef.current.srcObject = stream;
    
    // Using an event listener instead of direct play() call
    videoRef.current.onloadedmetadata = () => {
      if (videoRef.current) {
        videoRef.current.play()
          .then(() => {
            console.log("✅ Camera started successfully");
            setIsCameraOn(true);
            setIsPhotoCaptured(false);
            setSelectedImage(null);
          })
          .catch(err => {
            console.error("Failed to play video:", err);
          });
      }
    };
  } catch (error) {
    console.error("🔴 Error accessing webcam:", error);
  }
};

  // ✅ FIX: Capture photo properly
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error("🔴 Video or canvas not found!");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // ✅ Set proper canvas size
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    setTimeout(() => { 
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageUrl = canvas.toDataURL("image/png");

      if (!imageUrl || imageUrl.length < 100) {
        console.error("🔴 Captured image is empty!");
      } else {
        console.log("✅ Image captured successfully!");
        setSelectedImage(imageUrl);
        setIsPhotoCaptured(true);
      }
    }, 100);
  };

  // ✅ FIX: Stop camera properly
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOn(false);
  };
 

  // ✅ FIX: Detect mood from image
  const handleMoodDetection = async () => {
    if (!selectedImage) return;

    setLoading(true);
    try {
      const detectedMood = await detectMoodFromImage(selectedImage);
      const moodText = detectedMood && typeof detectedMood.mood === 'string' ? detectedMood.mood : "No Mood Detected ❌";
      setMood(moodText);
      onMoodDetected(moodText);

      // Fetch Spotify recommendations based on the detected mood
      const response = await fetch(`http://localhost:5000/recommendations/${encodeURIComponent(moodText)}`);
      const recommendationsData = await response.json();
      setRecommendations(recommendationsData);
    } catch (error) {
      console.error("🔴 Error detecting mood or fetching recommendations:", error);
      setMood("Mood Detection Failed 🚨");
      onMoodDetected("Mood Detection Failed 🚨");
      setRecommendations(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="image-capture">
      <div className="music-notes-animation">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="music-note">
            <MusicNote size={24} />
          </div>
        ))}
      </div>
      
      <div className="image-preview">
  {selectedImage ? (
    <img src={selectedImage || "/placeholder.svg"} alt="Captured" />
  ) : (
    // Always render the video element but hide it when not in use
    <>
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        style={{ display: isCameraOn ? 'block' : 'none' }} 
      />
      {!isCameraOn && (
        <div className="no-image">
          <MusicNote size={48} className="music-icon pulse" />
          <p>Capture or upload an image to detect your mood</p>
        </div>
      )}
    </>
  )}
</div>

      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>

      <div className="buttons">
        <label className="upload-btn">
          <Upload size={18} className="btn-icon" />
          <span>Upload Image</span>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </label>

        {!isCameraOn ? (
          <button className="webcam-btn" onClick={startCamera}>
            <Camera size={18} className="btn-icon" />
            <span>Use Webcam</span>
          </button>
        ) : (
          <>
            <button className="capture-btn" onClick={capturePhoto} disabled={isPhotoCaptured}>
              <Camera size={18} className="btn-icon" />
              <span>{isPhotoCaptured ? "Photo Captured" : "Capture Photo"}</span>
            </button>
            <button className="stop-btn" onClick={stopCamera}>
              <Stop size={18} className="btn-icon" />
              <span>Stop Camera</span>
            </button>
          </>
        )}
      </div>

      {selectedImage && (
        <button className="mood-btn" onClick={handleMoodDetection} disabled={loading}>
          <Smile size={18} className="btn-icon" />
          <span>{loading ? "Detecting Mood..." : "Detect Mood 🎭"}</span>
          <div className={`loading-spinner ${loading ? 'visible' : ''}`}></div>
        </button>
      )}

      {mood && <div className="mood-result">{mood}</div>}
      
      {recommendations && <SpotifyRecommendations recommendations={recommendations} />}
    </div>
  );
}

export default ImageCapture;
