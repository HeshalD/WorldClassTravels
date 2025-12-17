import React from 'react';
import PixelTransition from './PixelTransition';
import india from '../Images/india1.jpg';
import australia from '../Images/australia1.jpg';
import china from '../Images/china1.jpg';
import malaysia from '../Images/malaysia1.jpg';
import philippines from '../Images/philippines1.jpg';
import Masonry from './Masonry';
import travelVideo from '../Videos/flying.mp4';   

const items = [
    {
        id: "1",
        img: india,
        url: "https://example.com/one",
        height: 500,
    },
    {
        id: "2",
        img: china,
        url: "https://example.com/two",
        height: 500,
    },
    {
        id: "3",
        img: australia,
        url: "https://example.com/three",
        height: 500,
    },
    {
        id: "4",
        img: malaysia,
        url: "https://example.com/three",
        height: 500,
    },
    {
        id: "5",
        img: philippines,
        url: "https://example.com/three",
        height: 500,
    },
];

export default function TravelSection() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-8 relative overflow-hidden">
            {/* Video background – only change made */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                style={{ opacity: 0.4 }}
            >
                <source src={travelVideo} type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* All your original content stays exactly the same */}
            <div className="max-full ml-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
                {/* Left Side - Content */}
                <div className="flex items-center">
                    <div className="space-y-6">
                        <h1 className="text-5xl font-gilroyMedium text-black leading-tight">
                            Discover Your Next Adventure
                        </h1>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Explore breathtaking destinations around the world. From pristine beaches to majestic mountains,
                            create unforgettable memories with curated travel experiences tailored just for you.
                        </p>
                        <a href="#_" className="relative inline-flex items-center justify-start py-3 pl-4 pr-12 overflow-hidden font-gilroyMedium text-primaryBlue transition-all duration-150 ease-in-out rounded hover:pl-10 hover:pr-6 bg-gray-10 group">
                            <span className="absolute bottom-0 left-0 w-full h-1 transition-all duration-150 ease-in-out bg-primaryBlue group-hover:h-full"></span>
                            <span className="absolute right-0 pr-4 duration-200 ease-out group-hover:translate-x-12">
                                <svg className="w-5 h-5 text-secondaryBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </span>
                            <span className="absolute left-0 pl-2.5 -translate-x-12 group-hover:translate-x-0 ease-out duration-200">
                                <svg className="w-5 h-5 text-secondaryBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </span>
                            <span className="relative w-full text-left font-gilroyMedium transition-colors duration-200 ease-in-out group-hover:text-white">View Ticketing</span>
                        </a>
                    </div>
                </div>

                {/* Right Side - Masonry Grid */}
                <div className="flex items-center justify-center">
                    <Masonry
                        items={items}
                        ease="power3.out"
                        duration={0.6}
                        stagger={0.05}
                        animateFrom="top"
                        scaleOnHover={true}
                        hoverScale={0.95}
                        blurToFocus={true}
                        colorShiftOnHover={false}
                    />
                </div>
            </div>
        </div>
    );
}