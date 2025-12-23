import React, { useState, useContext } from 'react';
import { Plane, Calendar, Users, Mail, MessageCircle, ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import Header from '../Components/Header';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

export default function TicketingForm() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    tripType: 'round-trip',
    departureLocation: '',
    arrivalLocation: '',
    departureDate: '',
    returnDate: '',
    cabinType: 'economy',
    passengers: 1
  });

  const tripTypes = [
    { value: 'one-way', label: 'One Way' },
    { value: 'round-trip', label: 'Round Trip' },
    { value: 'multi-city', label: 'Multi City' }
  ];

  const cabinTypes = [
    { value: 'economy', label: 'Economy' },
    { value: 'premium', label: 'Premium Economy' },
    { value: 'business', label: 'Business Class' },
    { value: 'first', label: 'First Class' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleEdit = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (method) => {
    if (!user) {
      toast.error('Please login to book tickets');
      return;
    }

    // Get phone number from localStorage if not available in user object
    const userPhoneNumber = user.phoneNumber || localStorage.getItem('phoneNumber');

    // Validate phone number format if provided
    if (userPhoneNumber && !/^[0-9]{10,15}$/.test(userPhoneNumber)) {
      toast.error('Please enter a valid phone number (10-15 digits)');
      return;
    }

    if (method === 'api') {
      try {
        setIsSubmitting(true);
        const token = localStorage.getItem('token');

        // Check if phone number is required but not provided
        if (!userPhoneNumber) {
          toast.error('Phone number is required for booking');
          setIsSubmitting(false);
          return;
        }

        const ticketData = {
          userID: user.id,
          userFirstName: user.firstName,
          userLastName: user.lastName,
          userEmail: user.email,
          userPhoneNumber: userPhoneNumber, // Using the phone number from localStorage or user object
          tripType: formData.tripType,
          departureLocation: formData.departureLocation,
          arrivalLocation: formData.arrivalLocation,
          departureDate: formData.departureDate,
          returnDate: formData.tripType === 'round-trip' ? formData.returnDate : null,
          cabinType: formData.cabinType,
          passengers: formData.passengers
        };

        const response = await axios.post('http://localhost:5000/api/tickets', ticketData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data) {
          toast.success('Ticket request submitted successfully!');
          // Reset form or redirect to success page
          setCurrentStep(3);
        }
      } catch (error) {
        console.error('Error submitting ticket:', error);
        // Show more detailed error message from server
        const errorMessage = error.response?.data?.errors?.[0]?.msg || 
                           error.response?.data?.message || 
                           'Failed to submit ticket request. Please check your details and try again.';
        toast.error(errorMessage);
        console.error('Error details:', error.response?.data);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Fallback to email/whatsapp if needed
      const message = `
Customer Details: 
=======================================================
Name: ${user.firstName} ${user.lastName}
Email: ${user.email}
Phone Number: ${user.phoneNumber}
=======================================================
      
Flight Booking Details:
=======================================================
Trip Type: ${formData.tripType}
From: ${formData.departureLocation}
To: ${formData.arrivalLocation}
Departure: ${formData.departureDate}
${formData.returnDate ? `Return: ${formData.returnDate}\n` : ''}
Cabin: ${formData.cabinType}
Passengers: ${formData.passengers}
=======================================================`;

      if (method === 'email') {
        window.location.href = `mailto:?subject=Flight Booking Request&body=${encodeURIComponent(message)}`;
      } else if (method === 'whatsapp') {
        window.open(`https://wa.me/94706904865?text=${encodeURIComponent(message)}`, '_blank');
      }
    }
  };

  const isStep1Valid = formData.departureLocation &&
    formData.arrivalLocation &&
    formData.departureDate &&
    (formData.tripType !== 'round-trip' || formData.returnDate) &&
    formData.departureLocation !== formData.arrivalLocation;

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${require('../Images/flying.jpg')})` }}
    >
      <div className="w-full">
        <Header />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-4 sm:py-8">
        {/* Progress Indicator */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-gilroyMedium transition-all ${currentStep > step ? 'bg-green-500 text-white' :
                    currentStep === step ? 'border border-primaryBlue text-primaryBlue' :
                      'bg-gray-200 text-gray-500'
                    }`}>
                    {currentStep > step ? <Check size={20} /> : step}
                  </div>
                  <span className={`mt-2 text-xs sm:text-sm font-gilroyRegular ${currentStep >= step ? 'text-black' : 'text-gray-400'
                    }`}>
                    {step === 1 ? 'Details' : step === 2 ? 'Review' : 'Submit'}
                  </span>
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-1 mx-2 rounded ${currentStep > step ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          {/* Step 1: Input Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Plane className="text-primaryBlue" size={28} />
                <h2 className="text-2xl font-gilroyMedium text-gray-800">Flight Details</h2>
              </div>

              {/* Trip Type */}
              <div>
                <label className="block text-sm font-gilroyRegular text-gray-700 mb-2">Trip Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {tripTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => handleInputChange('tripType', type.value)}
                      className={`p-3 rounded-lg border-2 font-medium transition-all ${formData.tripType === type.value
                        ? 'border-blue-600 bg-gradient-to-t from-primaryBlue to-secondaryBlue text-white'
                        : 'border-gray-200 hover:border-primaryBlue'
                        }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Locations */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                  <input
                    type="text"
                    value={formData.departureLocation}
                    onChange={(e) => handleInputChange('departureLocation', e.target.value)}
                    placeholder="Departure city"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primaryBlue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                  <input
                    type="text"
                    value={formData.arrivalLocation}
                    onChange={(e) => handleInputChange('arrivalLocation', e.target.value)}
                    placeholder="Arrival city"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primaryBlue focus:border-transparent"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Departure Date</label>
                  <input
                    type="date"
                    value={formData.departureDate}
                    onChange={(e) => handleInputChange('departureDate', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primaryBlue focus:border-transparent"
                  />
                </div>
                {formData.tripType === 'round-trip' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Return Date</label>
                    <input
                      type="date"
                      value={formData.returnDate}
                      onChange={(e) => handleInputChange('returnDate', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primaryBlue focus:border-transparent"
                    />
                  </div>
                )}
              </div>

              {/* Cabin Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cabin Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {cabinTypes.map(cabin => (
                    <button
                      key={cabin.value}
                      onClick={() => handleInputChange('cabinType', cabin.value)}
                      className={`p-3 rounded-lg border-2 font-medium transition-all text-sm ${formData.cabinType === cabin.value
                        ? 'border-blue-600 bg-gradient-to-t from-primaryBlue to-secondaryBlue text-white'
                        : 'border-gray-200 hover:border-primaryBlue'
                        }`}
                    >
                      {cabin.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Passengers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Passengers</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleInputChange('passengers', Math.max(1, formData.passengers - 1))}
                    className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 font-bold"
                  >
                    -
                  </button>
                  <span className="text-xl font-gilroyRegular w-12 text-center">{formData.passengers}</span>
                  <button
                    onClick={() => handleInputChange('passengers', formData.passengers + 1)}
                    className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 font-bold"
                  >
                    +
                  </button>
                  <Users className="text-gray-400 ml-2" size={20} />
                </div>
              </div>

              <button
                onClick={handleNext}
                disabled={!isStep1Valid || isSubmitting}
                className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${isStep1Valid && !isSubmitting
                  ? 'bg-gradient-to-t from-primaryBlue to-secondaryBlue text-white hover:opacity-90'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    Submitting...
                  </>
                ) : (
                  'Continue'
                )}
              </button>
            </div>
          )}

          {/* Step 2: Review */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-gilroyMedium text-gray-800 mb-6">Review Your Booking</h2>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Trip Type</span>
                  <span className="font-gilroyMedium capitalize">{formData.tripType.replace('trip', ' Trip')}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Route</span>
                  <span className="font-gilroyMedium">{formData.departureLocation} → {formData.arrivalLocation}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Departure</span>
                  <span className="font-gilroyMedium">{formData.departureDate}</span>
                </div>
                {formData.tripType === 'round-trip' && (
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">Return</span>
                    <span className="font-gilroyMedium">{formData.returnDate}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-600">Cabin</span>
                  <span className="font-gilroyMedium capitalize">{formData.cabinType.replace('economy', 'Economy').replace('premium', 'Premium Economy').replace('business', 'Business Class').replace('first', 'First Class')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Passengers</span>
                  <span className="font-gilroyMedium">{formData.passengers}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-gilroyMedium hover:bg-gray-300 flex items-center justify-center gap-2"
                >
                  <ChevronLeft size={20} /> Back
                </button>
                <button
                  onClick={handleEdit}
                  className="flex-1 py-3 bg-gradient-to-t from-primaryBlue to-secondaryBlue text-white rounded-lg font-gilroyRegular hover:bg-secondaryBlue transition-all duration-300 transform hover:scale-[1.02]"
                >
                  Edit Details
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-3 bg-gradient-to-t from-primaryBlue to-secondaryBlue text-white rounded-lg font-gilroyRegular hover:bg-secondaryBlue transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  Continue <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Submit */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-gilroyMedium text-gray-800 mb-6">Submit Your Booking</h2>

              <p className="text-gray-600 mb-6">Choose how you'd like to submit your booking details:</p>

              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  onClick={() => handleSubmit('email')}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all group"
                >
                  <Mail className="text-blue-600 mb-3 group-hover:scale-110 transition-transform" size={32} />
                  <h3 className="font-gilroyMedium text-lg mb-2">Email</h3>
                  <p className="text-sm text-gray-600">Send booking details via email</p>
                </button>

                <button
                  onClick={() => handleSubmit('whatsapp')}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-600 hover:bg-green-50 transition-all group"
                >
                  <MessageCircle className="text-green-600 mb-3 group-hover:scale-110 transition-transform" size={32} />
                  <h3 className="font-gilroyMedium text-lg mb-2">WhatsApp</h3>
                  <p className="text-sm text-gray-600">Share booking via WhatsApp</p>
                </button>

              </div>
              <button
                onClick={() => handleSubmit('api')}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 p-3 bg-gradient-to-t from-primaryBlue to-secondaryBlue text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Plane size={18} />
                    {user ? 'Submit Booking Request' : 'Login to Book'}
                  </>
                )}
              </button>

              <button
                onClick={handleBack}
                className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg font-gilroyMedium hover:bg-gray-300 flex items-center justify-center gap-2 mt-6"
              >
                <ChevronLeft size={20} /> Back to Review
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}