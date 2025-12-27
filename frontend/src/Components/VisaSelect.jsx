import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { visaAPI } from '../services/api';

const VisaSelect = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const [visas, setVisas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 6;

  // Fetch visas from API
  useEffect(() => {
    const fetchVisas = async () => {
      try {
        const response = await visaAPI.getAll();
        console.log('API Response:', response); // Log the full response
        const data = response.data?.data || []; // Access the nested data array
        console.log('Visa Data:', data); // Log the data we're trying to set
        setVisas(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching visas:', err);
        setError('Failed to load visas. Please try again later.');
        setLoading(false);
        setVisas([]); // Ensure we always have an array
      }
    };

    fetchVisas();
  }, []);

  // Filter visas based on search query
  const filteredVisas = useMemo(() => {
    if (!searchQuery.trim()) return visas;
    return visas.filter(visa =>
      visa.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visa.type?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, visas]);

  const totalPages = Math.ceil(filteredVisas.length / itemsPerPage);
  const startIdx = currentPage * itemsPerPage;
  const displayedVisas = filteredVisas.slice(startIdx, startIdx + itemsPerPage);

  const handlePrevious = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0); // Reset to first page on search
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Search Bar */}
        <div className="flex justify-center mb-12">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search countries..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-gray-200 focus:border-primaryBlue focus:outline-none transition-colors shadow-lg"
            />
          </div>
        </div>

        {/* Cards Grid */}
        <div className="relative">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500 text-xl">{error}</p>
            </div>
          ) : displayedVisas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {displayedVisas.map((visa) => (
                <div
                  key={visa._id}
                  className="group relative h-64 rounded-xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  <img
                    src={visa.coverImage || 'https://via.placeholder.com/300x200?text=No+Image'}
                    alt={visa.country}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent transition-opacity duration-300 group-hover:from-black/80">
                    <div className="absolute bottom-0 left-0 right-0 p-4 transform transition-transform duration-300 group-hover:translate-y-0">
                      <h3 className="text-white text-xl font-gilroyRegular">{visa.country}</h3>
                      <p className="text-white/80 text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Click to view details
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500 text-xl">No visas found matching your search.</p>
            </div>
          )}

          {/* Navigation Buttons */}
          {filteredVisas.length > itemsPerPage && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={handlePrevious}
                disabled={currentPage === 0}
                className="p-3 rounded-full bg-white shadow-lg hover:bg-primaryBlue hover:text-white disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-800 disabled:cursor-not-allowed transition-all duration-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="text-gray-700 font-gilroyRegular text-md">
                Page {currentPage + 1} of {totalPages}
              </span>
              
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages - 1}
                className="p-3 rounded-full bg-white shadow-lg hover:bg-primaryBlue hover:text-white disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-800 disabled:cursor-not-allowed transition-all duration-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisaSelect;