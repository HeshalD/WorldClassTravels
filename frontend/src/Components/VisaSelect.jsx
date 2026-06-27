import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { visaAPI } from '../services/api';

const VisaSelect = ({ searchQuery = '' }) => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(0);

    const [visas, setVisas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const itemsPerPage = 6;

    // Fetch visas from API
    useEffect(() => {
        const fetchVisas = async () => {
            try {
                const response = await visaAPI.getAll();
                const data = response.data?.data || []; // Access the nested data array
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

    // Reset to first page whenever the search changes
    useEffect(() => {
        setCurrentPage(0);
    }, [searchQuery]);

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

    const handleVisaClick = (visa) => {
        // Navigate to visa page with visa data
        navigate('/visa-page', { state: { visa } });
    };

    return (
        <div className="relative bg-gray-50">
            <div className="py-16 px-4">
                <div className="max-w-7xl mx-auto">

                    {/* Section Heading */}
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">
                            Available Visa Destinations
                        </h2>
                        <p className="text-slate-600 font-gilroyRegular max-w-xl mx-auto">
                            Hand-picked visa packages for the world's most loved destinations, handled end-to-end by our team.
                        </p>
                    </div>

                    {/* Cards Grid */}
                    <div className="relative">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primaryBlue"></div>
                            </div>
                        ) : error ? (
                            <div className="text-center py-20">
                                <p className="text-red-500 text-xl">{error}</p>
                            </div>
                        ) : displayedVisas.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                                {displayedVisas.map((visa) => (
                                    <div
                                        key={visa._id}
                                        className="group bg-white rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                                        onClick={() => handleVisaClick(visa)}
                                    >
                                        {/* Image */}
                                        <div className="relative h-48 overflow-hidden">
                                            <img
                                                src={visa.coverImage || 'https://via.placeholder.com/300x200?text=No+Image'}
                                                alt={visa.country}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            {visa.duration && (
                                                <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-primaryBlue text-xs font-gilroyMedium px-3 py-1.5 rounded-full shadow-sm">
                                                    <Clock className="w-3 h-3" />
                                                    {visa.duration}
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="p-5">
                                            <h3 className="text-xl font-gilroyMedium text-slate-800 mb-1">{visa.country}</h3>
                                            <p className="text-slate-500 text-sm font-gilroyRegular mb-4 line-clamp-2">
                                                {visa.description || 'Tailored visa assistance for a smooth journey.'}
                                            </p>
                                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                                <div>
                                                    <span className="text-xs text-slate-400 font-gilroyRegular block">Starting from</span>
                                                    <span className="text-lg font-gilroyMedium text-primaryBlue">Rs. {visa.price?.toLocaleString()}/=</span>
                                                </div>
                                                <span className="flex items-center gap-1 text-sm font-gilroyMedium text-secondaryBlue group-hover:gap-2 transition-all duration-300">
                                                    View details
                                                    <ArrowRight className="w-4 h-4" />
                                                </span>
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
        </div>
    );
};

export default VisaSelect;
