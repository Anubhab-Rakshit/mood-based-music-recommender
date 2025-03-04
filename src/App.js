import React, { useState, useEffect } from "react";
import ImageCapture from "./components/ImageCapture";
import MoodDisplay from "./components/MoodDisplay";
import { Music } from 'lucide-react';
import "./App.css";

function App() {
  const [mood, setMood] = useState("Neutral & Calm 😌");
  
  // Function to update mood from ImageCapture
  const handleMoodDetected = (detectedMood) => {
    setMood(detectedMood || "No Mood Detected ❌");
  };
  
  // Create particles for the background
  useEffect(() => {
    const overlay = document.querySelector('.overlay');
    if (!overlay) return;
    
    // Clear any existing particles
    const existingParticles = document.querySelectorAll('.particle');
    existingParticles.forEach(p => p.remove());
    
    // Create particles
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      
      // Random size
      const size = Math.random() * 4 + 2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // Random position
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      
      // Random animation duration and delay
      const duration = Math.random() * 20 + 10;
      const delay = Math.random() * 10;
      particle.style.animation = `float ${duration}s infinite linear`;
      particle.style.animationDelay = `${delay}s`;
      
      // Random opacity
      particle.style.opacity = (Math.random() * 0.3 + 0.1).toString();
      
      overlay.appendChild(particle);
    }
    
    // Create floating music notes
    for (let i = 0; i < 10; i++) {
      const musicNote = document.createElement('div');
      musicNote.classList.add('music-note');
      
      // Set position
      musicNote.style.left = `${Math.random() * 90 + 5}%`;
      
      // Random animation delay
      const delay = Math.random() * 20;
      musicNote.style.animationDelay = `${delay}s`;
      
      const noteIcon = document.createElement('span');
      noteIcon.innerHTML = '♪';
      noteIcon.classList.add('note-icon');
      
      musicNote.appendChild(noteIcon);
      overlay.appendChild(musicNote);
    }
    
    return () => {
      // Clean up particles when component unmounts
      const particles = document.querySelectorAll('.particle, .music-note');
      particles.forEach(p => p.remove());
    };
  }, []);

  return (
    <div className="app-container">
      <div className="overlay"></div>
      <div className="content">
        <h1 className="title">
          <Music className="title-icon" size={32} />
          Tune In
        </h1>
        <p className="subtitle">
          Upload an image and let AI find the perfect Spotify playlist for you!
        </p>

        {/* Image Upload & Capture Component */}
        <ImageCapture onMoodDetected={handleMoodDetected} />

        {/* Mood Display */}
        <MoodDisplay mood={mood} />
      </div>
    </div>
  );
}

export default App;
