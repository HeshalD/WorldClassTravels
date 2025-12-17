import React, { useState, useEffect } from 'react';
import australiaVideo from '../Videos/australiaVid1.mp4';
import indiaVideo from '../Videos/indiaVid1.mp4';
import chinaVideo from '../Videos/chinaVid1.mp4';
import canadaVideo from '../Videos/canadaVid1.mp4';
import phillippinesVideo from '../Videos/philippinesVid1.mp4';
import americaVideo from '../Videos/americaVid1.mp4';
import Header from './Header';


export default function TravelHero() {
  const [currentVideo, setCurrentVideo] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Array of video URLs - replace these with your actual video URLs
  const videos = [
    australiaVideo,
    chinaVideo,
    canadaVideo,
    phillippinesVideo,
    americaVideo
  ];

  useEffect(() => {
    const currentVideoElement = document.getElementById(`hero-video-${currentVideo}`);
    const nextVideoIndex = (currentVideo + 1) % videos.length;
    const nextVideoElement = document.getElementById(`hero-video-${nextVideoIndex}`);
    
    const handleVideoEnd = () => {
      // Preload and prepare next video
      if (nextVideoElement) {
        nextVideoElement.currentTime = 0;
        nextVideoElement.load();
      }
      
      setIsTransitioning(true);
      
      // Start playing next video immediately
      if (nextVideoElement) {
        nextVideoElement.play().catch(err => console.log('Video play error:', err));
      }
      
      // Change current video after a short delay for crossfade
      setTimeout(() => {
        setCurrentVideo(nextVideoIndex);
        setIsTransitioning(false);
      }, 100);
    };

    if (currentVideoElement) {
      // Play the current video
      currentVideoElement.play().catch(err => console.log('Video play error:', err));
      currentVideoElement.addEventListener('ended', handleVideoEnd);
    }

    // Preload next video
    if (nextVideoElement) {
      nextVideoElement.load();
    }

    return () => {
      if (currentVideoElement) {
        currentVideoElement.removeEventListener('ended', handleVideoEnd);
      }
    };
  }, [currentVideo, videos.length]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Video Background with Crossfade */}
      {videos.map((video, index) => (
        <video
          key={index}
          id={`hero-video-${index}`}
          className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
            index === currentVideo ? 'opacity-100' : 'opacity-0'
          }`}
          muted
          playsInline
          preload="auto"
        >
          <source src={video} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ))}

      {/* Dark Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-40"></div>

      {/* Header */}
      <div className="relative z-20">
        <Header />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-end h-full pb-20 px-6">
        <h1 className="text-5xl md:text-7xl font-gilroyRegular text-white text-center mb-4 drop-shadow-2xl ">
          Welcome to WorldClass Travels
        </h1>
        <p className="text-xl md:text-xl text-white text-center max-w-3xl drop-shadow-lg">
          Explore breathtaking destinations and create unforgettable memories around the world
        </p>
        
        {/* Optional CTA Button */}
        <a href="#explore" className="relative inline-block text-lg group mt-8 mb-8">
          <span className="relative z-10 block px-8 py-3 overflow-hidden font-medium leading-tight text-white transition-all duration-300 ease-out border border-white rounded-lg group-hover:text-white group-hover:scale-105">
            <span className="absolute inset-0 w-full h-full px-5 py-3 rounded-lg bg-transparent"></span>
            <span className="absolute left-0 w-48 h-48 -ml-2 transition-all duration-300 origin-top-right -rotate-90 -translate-x-full translate-y-12 bg-gradient-to-r from-blue-600 to-blue-400 group-hover:-rotate-180 ease"></span>
            <span className="relative">Start Exploring</span>
          </span>
        </a>
      </div>

      {/* Video Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {videos.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentVideo(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentVideo ? 'bg-white w-8' : 'bg-white bg-opacity-50'
            }`}
            aria-label={`Go to video ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}