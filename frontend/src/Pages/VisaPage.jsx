import React, { useState } from 'react';
import { X, ArrowLeft, MessageCircle, Mail, Clock, BadgeCheck } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../Components/Header';

const VisaPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const visa = location.state?.visa;
  const [showForm, setShowForm] = useState(false);
  const [showContactOptions, setShowContactOptions] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    nationality: '',
    passportNumber: '',
    travelDate: '',
    purpose: ''
  });

  // Use visa data from navigation state or fallback to sample data
  const countryData = visa || {
    country: 'United States',
    coverImage: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=1600&q=80',
    description: 'The United States offers various visa categories for tourists, business travelers, students, and workers. Whether you\'re planning to visit iconic landmarks, pursue educational opportunities, or explore business ventures, we can help you navigate the visa application process. Our service provides comprehensive support to ensure your application meets all requirements.',
    price: 150000,
    duration: '90 days',
    type: 'Tourist Visa'
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

    // Show contact options
    setShowContactOptions(true);
  };

  const formatFormData = () => {
    return `*Visa Details Request*\n\n*Personal Information:*\n• Full Name: ${formData.fullName}\n• Email: ${formData.email}\n• Phone: ${formData.phone}\n• Nationality: ${formData.nationality}\n\n*Travel Details:*\n• Passport Number: ${formData.passportNumber}\n• Expected Travel Date: ${formData.travelDate}\n• Purpose of Travel: ${formData.purpose}\n\n*Visa Information:*\n• Destination: ${countryData.country}\n• Visa Type: ${countryData.type}\n• Price: Rs.${countryData.price}/=\n\n*Submitted on:* ${new Date().toLocaleString()}`;
  };

  const handleWhatsApp = () => {
    const message = formatFormData();
    const phoneNumber = '94706904865';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmail = () => {
    const message = formatFormData();
    const subject = `Visa Details Request - ${formData.fullName} - ${countryData.country}`;
    const email = 'heshaltempdissanayake@gmail.com';
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image Section */}
      <div className="relative h-[420px] w-full overflow-hidden">
        <img
          src={countryData.coverImage}
          alt={countryData.country}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-transparent to-transparent"></div>

        <div className="absolute top-0 left-0 right-0 z-20">
          <Header />
        </div>

        <button
          onClick={() => navigate('/visa-select')}
          className="absolute top-24 left-4 md:left-8 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-sm text-slate-700 hover:bg-white px-4 py-2 rounded-full shadow-md transition-colors font-gilroyMedium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to visas</span>
        </button>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 -mt-24 relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">

          {/* Country Name and Price */}
          <div className="text-center mb-6">
            {countryData.type && (
              <span className="inline-flex items-center gap-1.5 bg-primaryBlue/10 text-primaryBlue text-xs font-gilroyMedium px-3 py-1.5 rounded-full mb-4">
                <BadgeCheck className="w-3.5 h-3.5" />
                {countryData.type}
              </span>
            )}
            <h1 className="text-4xl md:text-5xl font-gilroyMedium text-slate-800 mb-3">
              {countryData.country}
            </h1>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {countryData.duration && (
                <span className="flex items-center gap-1.5 text-slate-500 font-gilroyRegular text-sm">
                  <Clock className="w-4 h-4" />
                  Valid for {countryData.duration}
                </span>
              )}
              {countryData.price && (
                <span className="text-2xl font-gilroyMedium text-primaryBlue">Rs. {countryData.price?.toLocaleString()}/=</span>
              )}
            </div>
          </div>

          <div className="w-16 h-1 bg-gradient-to-r from-primaryBlue to-primaryCyan rounded-full mx-auto mb-8"></div>

          {/* Description */}
          <p className="text-slate-600 font-gilroyRegular text-lg leading-relaxed text-center mb-10">
            {countryData.description}
          </p>

          {/* Request Button */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-primaryBlue to-secondaryBlue text-white font-gilroyMedium px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Request Visa Details
            </button>
          </div>
        </div>
      </div>

      {/* Contact Options Modal */}
      {showContactOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-gilroyMedium text-slate-800">Choose Contact Method</h3>
              <button
                onClick={() => setShowContactOptions(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <p className="text-slate-600 font-gilroyRegular mb-6 text-center">
              How would you like to send your visa details request?
            </p>

            <div className="space-y-3">
              <button
                onClick={handleWhatsApp}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-500 hover:bg-green-600 text-white font-gilroyMedium rounded-lg transition-colors shadow-lg hover:shadow-xl"
              >
                <MessageCircle className="w-5 h-5" />
                Send via WhatsApp
              </button>

              <button
                onClick={handleEmail}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-primaryBlue to-secondaryBlue text-white font-gilroyMedium rounded-lg transition-colors shadow-lg hover:shadow-xl"
              >
                <Mail className="w-5 h-5" />
                Send via Email
              </button>

              <button
                onClick={() => {
                  setShowContactOptions(false);
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
                }}
                className="w-full px-6 py-3 border border-gray-300 text-slate-700 font-gilroyMedium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Section */}
      {showForm && (
        <div className="relative mt-8">
          {/* Background Image - tied to this destination */}
          <div className="absolute inset-0 h-96 overflow-hidden">
            <img
              src={countryData.coverImage}
              alt={countryData.country}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-primaryBlue/30"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-gray-50/20 via-gray-50/80 to-gray-50"></div>
          </div>

          {/* Form Container */}
          <div className="relative z-10 max-w-4xl mx-auto px-4 pt-12">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-primaryBlue to-secondaryBlue p-6 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-gilroyMedium text-white">Visa Details Request</h2>
                  <p className="text-white/80 font-gilroyRegular text-sm mt-1">For your trip to {countryData.country}</p>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Form Content */}
              <div className="p-6 space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-gilroyMedium text-slate-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primaryBlue focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-gilroyMedium text-slate-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primaryBlue focus:border-transparent transition-all"
                    placeholder="your.email@example.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-gilroyMedium text-slate-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primaryBlue focus:border-transparent transition-all"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                {/* Nationality */}
                <div>
                  <label className="block text-sm font-gilroyMedium text-slate-700 mb-2">
                    Nationality *
                  </label>
                  <input
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primaryBlue focus:border-transparent transition-all"
                    placeholder="Your nationality"
                  />
                </div>

                {/* Passport Number */}
                <div>
                  <label className="block text-sm font-gilroyMedium text-slate-700 mb-2">
                    Passport Number *
                  </label>
                  <input
                    type="text"
                    name="passportNumber"
                    value={formData.passportNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primaryBlue focus:border-transparent transition-all"
                    placeholder="Enter your passport number"
                  />
                </div>

                {/* Travel Date */}
                <div>
                  <label className="block text-sm font-gilroyMedium text-slate-700 mb-2">
                    Expected Travel Date *
                  </label>
                  <input
                    type="date"
                    name="travelDate"
                    value={formData.travelDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primaryBlue focus:border-transparent transition-all"
                  />
                </div>

                {/* Purpose of Travel */}
                <div>
                  <label className="block text-sm font-gilroyMedium text-slate-700 mb-2">
                    Purpose of Travel *
                  </label>
                  <textarea
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primaryBlue focus:border-transparent transition-all"
                    placeholder="Describe the purpose of your travel"
                    rows="3"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-slate-700 font-gilroyMedium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-primaryBlue to-secondaryBlue text-white font-gilroyMedium rounded-lg transition-colors shadow-lg hover:shadow-xl"
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
