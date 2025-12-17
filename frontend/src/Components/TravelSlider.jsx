import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import india from '../Images/india1.jpg'
import malaysia from '../Images/malaysia1.jpg'
import china from '../Images/china1.jpg'
import philippines from '../Images/philippines1.jpg'
import australia from '../Images/australia1.jpg'

const TravelSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Sample destinations - you can replace with your own
  const destinations = [
    {
      id: 1,
      name: 'India',
      nickname: 'The Golden Sparrow',
      image: india,
      description: 'Experience the vibrant soul of India, where ancient temples rise beside bustling streets, golden deserts meet lush backwaters, snow-capped Himalayas frame serene valleys, and every sunrise and sunset paints a land rich with color, culture, and timeless traditions.'
    },
    {
      id: 2,
      name: 'Malaysia',
      nickname: 'Land of the Eternal Summer',
      image: malaysia,
      description: 'Experience the charm of Malaysia, where emerald rainforests shelter exotic wildlife, modern skylines blend with colonial heritage, pristine islands meet turquoise seas, and diverse cultures come together in a tapestry of flavors, festivals, and warm hospitality.'
    },
    {
      id: 3,
      name: 'China',
      nickname: 'Land of the Dragon',
      image: china,
      description: 'Experience the grandeur of China, where ancient dynasties echo through majestic walls and temples, mist-shrouded mountains inspire timeless art, vibrant мегacities pulse with modern life, and centuries of tradition flow seamlessly into the future.'
    },
    {
      id: 4,
      name: 'Philippines',
      nickname: 'Pearl of the Orient Seas',
      image: philippines,
      description: 'Experience the beauty of the Philippines—where over seven thousand sun-drenched islands boast powdery white beaches and turquoise waters, emerald rice terraces rise through misty highlands, vibrant festivals fill the air with music and color, and heartfelt hospitality makes every journey unforgettable.'
    },
    {
      id: 5,
      name: 'Australia',
      nickname: 'The Land Down Under',
      image: australia,
      description: 'Experience the spirit of Australia, where golden beaches stretch beneath endless blue skies, the Great Barrier Reef teems with life, rugged outback landscapes tell ancient stories, and cosmopolitan cities thrive alongside a deep connection to nature and adventure.'
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % destinations.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + destinations.length) % destinations.length);
  };

  const currentDestination = destinations[currentIndex];

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Image with Transition */}
      <div className="absolute inset-0">
        {destinations.map((dest, index) => (
          <div
            key={dest.id}
            className={`absolute inset-0 transition-opacity duration-700 ${index === currentIndex ? 'opacity-110' : 'opacity-0'
              }`}
          >
            <img
              src={dest.image}
              alt={dest.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>
        ))}
      </div>

      {/* Content Container */}
      <div className="relative z-10 h-full flex">
        {/* Left Side - Text Content */}
        <div className="w-4/5 flex items-center px-16">
          <div className="text-white max-w-2xl">
            <div className="overflow-hidden">
              <p
                key={`desc-${currentIndex}`}
                className="text-xl leading-relaxed font-gilroyRegular mb-2 text-white animate-[slideIn_0.7s_ease-out_0.1s_both] text-shadow-lg"
              >
                {currentDestination.nickname}
              </p>
            </div>
            <div className="overflow-hidden">
              <h1
                key={`name-${currentIndex}`}
                className="text-8xl font-gilroyBold uppercase mb-4 animate-[slideIn_0.7s_ease-out] text-shadow-lg"
              >
                {currentDestination.name}
              </h1>
            </div>
            <div className="overflow-hidden">
              <p
                key={`desc-${currentIndex}`}
                className="text-l leading-relaxed font-gilroyRegular text-white/90 animate-[slideIn_0.7s_ease-out_0.1s_both] text-shadow-lg"
              >
                {currentDestination.description}
              </p>
            </div>
            <a 
                href="#_" 
                key={`btn-${currentIndex}`}
                class="relative inline-flex items-center justify-start py-3 pl-4 pr-12 overflow-hidden font-gilroyMedium text-white transition-all duration-150 ease-in-out rounded hover:pl-10 hover:pr-6 bg-transparent group mt-[50px] animate-[slideIn_0.7s_ease-out_0.2s_both]"
              >
              <span class="absolute bottom-0 left-0 w-full h-1 transition-all duration-150 ease-in-out bg-white group-hover:h-full"></span>
              <span class="absolute right-0 pr-4 duration-200 ease-out group-hover:translate-x-12">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </span>
              <span class="absolute left-0 pl-2.5 -translate-x-12 group-hover:translate-x-0 ease-out duration-200">
                <svg class="w-5 h-5 text-primaryBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </span>
              <span class="relative w-full text-left font-gilroyMedium transition-colors duration-200 ease-in-out group-hover:text-primaryBlue">View Visa Reservations</span>
            </a>
          </div>
        </div>

        {/* Right Side - Slider */}
        <div className="w-1/4 flex items-center justify-center py-[20vh] pr-6 mr-[150px]">
          <div className="relative h-full w-full bg-transparent">
            <div className="h-full overflow-visible rounded-3xl shadow-2xl">
              <div
                className="flex flex-col transition-transform duration-700 ease-out h-full"
                style={{ transform: `translateY(-${currentIndex * 100}%)` }}
              >
                {destinations.map((dest) => (
                  <div key={dest.id} className="min-h-full w-full mb-6">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons - Bottom Center */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4 z-20">
        <button
          onClick={prevSlide}
          className="bg-white/20 backdrop-blur-md p-2 rounded-full shadow-lg hover:bg-white/30 transition-all hover:scale-105 border border-white/30"
        >
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>

        <button
          onClick={nextSlide}
          className="bg-white/20 backdrop-blur-md p-2 rounded-full shadow-lg hover:bg-white/30 transition-all hover:scale-105 border border-white/30"
        >
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Custom Animation Styles */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default TravelSlider;