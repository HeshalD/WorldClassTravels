import React, { useState } from 'react';
import { MapPin, Calendar, DollarSign, Search } from 'lucide-react';
import Header from './Header';
export default function TravelHero() {
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [price, setPrice] = useState('');

  return (
    <div className="h-[600px] bg-gradient-to-br from-sky-400 via-blue-400 to-blue-200">
        <Header/>

      {/* Hero Content */}
      <div className="flex flex-col items-center justify-center px-4 mt-20">
        <p className="text-blue-900 font-medium mb-2">Trip Booking</p>
        <h1 className="text-4xl md:text-6xl font-bold text-blue-900 mb-16 text-center">
          Search Your Trips Now
        </h1>

        {/* Search Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Location */}
            <div className="relative">
              <label className="block text-gray-600 text-sm mb-2">Location</label>
              <div className="flex items-center border-b border-gray-300 pb-2">
                <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Where to?"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full outline-none text-gray-700"
                />
              </div>
            </div>

            {/* Check-in - Check-out */}
            <div className="relative">
              <label className="block text-gray-600 text-sm mb-2">Check in - Check out</label>
              <div className="flex items-center border-b border-gray-300 pb-2">
                <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Add dates"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full outline-none text-gray-700"
                />
              </div>
            </div>

            {/* Price */}
            <div className="relative">
              <label className="block text-gray-600 text-sm mb-2">Price</label>
              <div className="flex items-center border-b border-gray-300 pb-2">
                <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Your budget"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full outline-none text-gray-700"
                />
              </div>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <button className="w-full bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-800 transition flex items-center justify-center space-x-2">
                <Search className="w-5 h-5" />
                <span>Search</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative clouds */}
      <div className="absolute top-20 left-10 w-32 h-16 bg-white/20 rounded-full blur-xl"></div>
      <div className="absolute top-40 right-20 w-40 h-20 bg-white/20 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 left-1/4 w-48 h-24 bg-white/20 rounded-full blur-xl"></div>
    </div>
  );
}