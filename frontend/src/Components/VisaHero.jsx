import React from 'react';
import { Search, Globe2 } from 'lucide-react';
import Header from './Header';

export default function VisaHero({ searchQuery, onSearchChange }) {
  return (
    <div className="relative h-[480px] overflow-hidden bg-gradient-to-br from-primaryBlue via-secondaryBlue to-primaryCyan">
      {/* Decorative accents */}
      <div className="absolute -top-10 -right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primaryCyan/20 rounded-full blur-3xl"></div>
      <div className="absolute top-1/3 left-1/4 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>

      <Header />

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 mt-10">
        <div className="flex items-center gap-2 text-white/80 font-gilroyMedium mb-2">
          <Globe2 className="w-4 h-4" />
          <p>Visa Services</p>
        </div>
        <h1 className="text-4xl md:text-6xl font-gilroyMedium text-white mb-3 text-center drop-shadow-md">
          Find the Right Visa <br className="hidden md:block" /> for Your Next Journey
        </h1>
        <p className="text-white/80 font-gilroyRegular text-center max-w-xl mb-10">
          Browse visa options for popular destinations and let us handle the paperwork while you plan the adventure.
        </p>

        {/* Search Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-3 w-full max-w-xl flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400 ml-2 shrink-0" />
          <input
            type="text"
            placeholder="Search by country or visa type..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full outline-none text-gray-700 font-gilroyRegular py-2"
          />
        </div>
      </div>
    </div>
  );
}
