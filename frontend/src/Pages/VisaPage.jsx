import React, { useState } from 'react';
import { X } from 'lucide-react';
import flyingImage from '../Images/flying.jpg'

const VisaPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    nationality: '',
    passportNumber: '',
    travelDate: '',
    purpose: ''
  });

  // Sample country data - this would be passed as props in a real app
  const countryData = {
    name: 'United States',
    coverImage: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=1600&q=80',
    description: 'The United States offers various visa categories for tourists, business travelers, students, and workers. Whether you\'re planning to visit iconic landmarks, pursue educational opportunities, or explore business ventures, we can help you navigate the visa application process. Our service provides comprehensive support to ensure your application meets all requirements.'
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.fullName || !formData.email || !formData.phone || 
        !formData.nationality || !formData.passportNumber || 
        !formData.travelDate || !formData.purpose) {
      alert('Please fill in all required fields');
      return;
    }
    
    console.log('Form submitted:', formData);
    alert('Visa details request submitted successfully!');
    setShowForm(false);
    // Reset form
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      nationality: '',
      passportNumber: '',
      travelDate: '',
      purpose: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image Section */}
      <div className="relative h-96 w-full overflow-hidden">
        <img
          src={countryData.coverImage}
          alt={countryData.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-gray-50/50 to-transparent"></div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 -mt-32 relative z-10">
        <div className="bg-transparent rounded-2xl l p-8 md:p-12">
          {/* Country Name */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-6">
            {countryData.name}
          </h1>

          {/* Description */}
          <p className="text-gray-600 text-lg leading-relaxed text-center mb-8">
            {countryData.description}
          </p>

          {/* Request Button */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Request Visa Details
            </button>
          </div>
        </div>
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="relative mt-8">
          {/* Background Image */}
          <div className="absolute inset-0 h-96 overflow-hidden">
            <img
              src={flyingImage}
              alt="Travel"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-gray-50/70 to-transparent"></div>
          </div>
          
          {/* Form Container */}
          <div className="relative z-10 max-w-4xl mx-auto px-4 pt-8">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Form Header */}
              <div className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Visa Details Request</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Form Content */}
              <div className="p-6 space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="your.email@example.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                {/* Nationality */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nationality *
                  </label>
                  <input
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Your nationality"
                  />
                </div>

                {/* Passport Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passport Number *
                  </label>
                  <input
                    type="text"
                    name="passportNumber"
                    value={formData.passportNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Enter passport number"
                  />
                </div>

                {/* Travel Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Travel Date *
                  </label>
                  <input
                    type="date"
                    name="travelDate"
                    value={formData.travelDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Purpose */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purpose of Visit *
                  </label>
                  <select
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select purpose</option>
                    <option value="tourism">Tourism</option>
                    <option value="business">Business</option>
                    <option value="education">Education</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
                  >
                    Submit Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisaPage;