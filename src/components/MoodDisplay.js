import React, { useEffect, useRef } from "react";
import "../styles/MoodDisplay.css";
import { Music, Headphones } from 'lucide-react';

const MoodDisplay = ({ mood }) => {
  const canvasRef = useRef(null);
  
  // Dynamic Background Color Based on Mood
  const moodColors = {
    "Happy & Energetic 🎉": "#FFD700", // Gold
    "Sad & Melancholic 😢": "#6495ED", // Cornflower Blue
    "Frustrated & Stressed 😤": "#FF4500", // Red-Orange
    "Curious & Amazed 🤩": "#8A2BE2", // Purple
    "Neutral & Calm 😌": "#20B2AA", // Light Sea Green
    "No Face Detected ❌": "#D3D3D3", // Light Grey
    "Error Processing Image ❌": "#FF0000" // Red
  };
  
  // Emoji mapping for moods
  const moodEmojis = {
    "Happy & Energetic 🎉": "🎵 🎉 🎸",
    "Sad & Melancholic 😢": "🎹 😢 🎻",
    "Frustrated & Stressed 😤": "🥁 😤 🎧",
    "Curious & Amazed 🤩": "✨ 🤩 🎷",
    "Neutral & Calm 😌": "🎶 😌 🎼",
    "No Face Detected ❌": "❓ ❌ 🎤",
    "Error Processing Image ❌": "⚠️ ❌ 🎺"
  };

  // Audio visualizer effect
  useEffect(() => {
    if (!canvasRef.current || !mood) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    let animationId;
    const bars = 60;
    const barWidth = width / bars;
    
    const getRandomHeight = () => Math.random() * height * 0.8;
    
    const barHeights = Array(bars).fill(0).map(() => getRandomHeight());
    
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Get color based on mood
      const color = moodColors[mood] || "#1DB954";
      
      for (let i = 0; i < bars; i++) {
        // Animate bar heights
        barHeights[i] += (getRandomHeight() - barHeights[i]) * 0.1;
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeights[i]);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, '#ffffff');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(i * barWidth, height - barHeights[i], barWidth - 2, barHeights[i]);
      }
      
      animationId = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [mood]);

  return (
    <div className="mood-display-wrapper">
      <div 
        className="mood-container"
        style={{ 
          borderColor: moodColors[mood] || "#1DB954",
          boxShadow: `0 0 20px ${moodColors[mood] || "#1DB954"}` 
        }}
      >
        <div className="mood-visualizer">
          <canvas ref={canvasRef} width="300" height="60"></canvas>
        </div>
        
        <div className="mood-content">
          <div className="mood-icon">
            <Music size={28} />
          </div>
          <h2 className="mood-text">{mood}</h2>
          <div className="mood-icon">
            <Headphones size={28} />
          </div>
        </div>
        
        <div className="mood-emoji">
          {moodEmojis[mood] || "🎵 🎧 🎶"}
        </div>
      </div>
    </div>
  );
};

export default MoodDisplay;
