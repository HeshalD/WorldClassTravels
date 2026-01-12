import React, { useState, useContext } from 'react';
import { Plane, Calendar, Users, Mail, MessageCircle, ChevronLeft, ChevronRight, Check, Loader2, RefreshCw, MapPin } from 'lucide-react';
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
          userID: user._id,
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

        // Validate that we have a user ID
        if (!ticketData.userID) {
          toast.error('User ID is missing. Please log in again.');
          setIsSubmitting(false);
          return;
        }

        const response = await axios.post(`${process.env.REACT_APP_API_URL}/tickets`, ticketData, {
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

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-4 sm:py-8">


        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          {/* Progress Indicator */}
          <div className="bg-transparent max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3].map((step) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-gilroyMedium transition-all ${currentStep > step ?
                      (step === 1 ? 'bg-primaryCyan text-white' :
                        step === 2 ? 'bg-secondaryBlue text-white' :
                          'bg-primaryBlue text-white') :
                      currentStep === step ? (step === 3 ? 'bg-primaryBlue text-white' : step === 2 ? 'bg-secondaryBlue text-white' : 'bg-[#26C6DA] text-white') :
                        'bg-gray-200 text-gray-500'
                      }`}>
                      {step}
                    </div>
                    <span className={`mt-2 text-xs sm:text-[12px] font-gilroyRegular transition-all ${currentStep > step ?
                      (step === 1 ? 'text-primaryCyan' :
                        step === 2 ? 'text-secondayBlue' :
                          'text-green-500') :
                      currentStep === step ? (step === 3 ? 'text-primaryBlue' : step === 2 ? 'text-secondaryBlue' : 'text-[#26C6DA]') :
                        'text-gray-400'
                      }`}>
                      {step === 1 ? 'Details' : step === 2 ? 'Review' : 'Submit'}
                    </span>
                  </div>
                  {step < 3 && (
                    <div className={`flex-1 h-1 mx-2 rounded ${currentStep > step ?
                      (step === 1 ? 'bg-gradient-to-r from-[#26C6DA] to-[#0892D0]' : 'bg-gradient-to-r from-[#0892D0] to-[#1E488F]') : 'bg-gray-200'
                      }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          {/* Step 1: Input Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6 justify-center">
                <h3 className="text-md font-gilroyMedium text-gray-800">Step 1 of 3 : Provide your flight details</h3>
              </div>

              {/* Trip Type 
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
              </div>*/}
              <div className="flex rounded-full max-w-2xl mx-auto bg-transparent border border-primaryBlue p-1">
                {tripTypes.map(type => (
                  <button
                    key={type.value}
                    onClick={() => handleInputChange('tripType', type.value)}
                    className={`flex-1 py-2.5 px-4 rounded-full text-sm font-medium transition-all ${formData.tripType === type.value
                      ? 'bg-primaryBlue text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              {/* Locations */}
              <div className="grid sm:grid-cols-2 gap-4 relative">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={formData.departureLocation}
                      onChange={(e) => handleInputChange('departureLocation', e.target.value)}
                      placeholder="Departure City"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg "
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    const temp = formData.departureLocation;
                    handleInputChange('departureLocation', formData.arrivalLocation);
                    handleInputChange('arrivalLocation', temp);
                  }}
                  className="absolute left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2 bg-white border-2 border-gray-300 rounded-full p-2 hover:bg-gray-50 transition-all z-10 shadow-md"
                  title="Swap locations"
                >
                  <RefreshCw size={16} className="text-gray-600" />
                </button>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={formData.arrivalLocation}
                      onChange={(e) => handleInputChange('arrivalLocation', e.target.value)}
                      placeholder="Arrival City"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg "
                    />
                  </div>
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
                    className="w-full p-3 border border-gray-300 rounded-lg  "
                  />
                </div>
                {formData.tripType === 'round-trip' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Return Date</label>
                    <input
                      type="date"
                      value={formData.returnDate}
                      onChange={(e) => handleInputChange('returnDate', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg  "
                    />
                  </div>
                )}
              </div>

              {/* Cabin Type */}
              <div className='max-w-xs'>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cabin Type</label>
                <select
                  value={formData.cabinType}
                  onChange={(e) => handleInputChange('cabinType', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {cabinTypes.map(cabin => (
                    <option key={cabin.value} value={cabin.value}>
                      {cabin.label}
                    </option>
                  ))}
                </select>
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
                className={`px-8 py-2 rounded-full font-medium transition-all flex items-center justify-center gap-2 ${isStep1Valid && !isSubmitting
                  ? 'bg-primaryBlue text-white hover:bg-secondaryBlue transition-all duration-300 transform hover:scale-[1.02]'
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
              <div className="flex items-center gap-3 mb-6 justify-center">
                <h3 className="text-md font-gilroyMedium text-gray-800">Step 2 of 3 : Please confirm your ticket details</h3>
              </div>

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

              <div className="flex gap-5">
                <button
                  onClick={handleBack}
                  className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-gilroyMedium hover:bg-gray-300 flex items-center justify-center gap-2"
                >
                  <ChevronLeft size={20} /> Back
                </button>
                <button
                  onClick={handleEdit}
                  className="flex-1 py-2 bg-primaryBlue text-white rounded-lg font-gilroyRegular hover:bg-secondaryBlue transition-all duration-300 transform hover:scale-[1.02]"
                >
                  Edit Details
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-2 bg-primaryBlue from-primaryBlue to-secondaryBlue text-white rounded-lg font-gilroyRegular hover:bg-secondaryBlue transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  Continue <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Submit */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6 justify-center">
                <h3 className="text-md font-gilroyMedium text-gray-800">Step 3 of 3 : Choose how you'd like to submit your booking details</h3>
              </div>

              <div className="flex items-center justify-center p-8">
                <div className="flex gap-6 flex-wrap justify-center">
                  {/* Email Card */}

                  <button onClick={() => handleSubmit('email')} className="bg-white border border-gray-200 rounded-2xl p-8 w-64 transition-all duration-300 hover:bg-red-50 hover:border-red-200 cursor-pointer group">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <Mail className="w-6 h-6 text-red-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Email</h3>
                        <p className="text-sm text-gray-500">Send Details via Email</p>
                      </div>
                    </div>
                  </button>


                  {/* WhatsApp Card */}
                 
                    <button
                  onClick={() => handleSubmit('whatsapp')}
                  className="bg-white border border-gray-200 rounded-2xl p-8 w-64 transition-all duration-300 hover:bg-green-50 hover:border-green-200 cursor-pointer group">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <svg className="w-6 h-6 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Whatsapp</h3>
                        <p className="text-sm text-gray-500">Send Details via Whatsapp</p>
                      </div>
                    </div>
                    </button>
                  
                </div>
              </div>

              <button
                onClick={() => handleSubmit('api')}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 p-3 bg-primaryBlue text-white rounded-lg hover:bg-secondaryBlue transition-all duration-300 transform hover:scale-[1.02] disabled:cursor-not-allowed"
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