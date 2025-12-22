import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import Footer from '../Components/Footer';

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
    });
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        if (!acceptTerms) {
            setError('You must accept the terms and conditions');
            return;
        }

        try {
            setIsSubmitting(true);
            const { confirmPassword, ...userData } = formData;
            const response = await authAPI.register(userData);
            
            if (response.data.success) {
                // Redirect to OTP verification with email
                navigate('/verify-registration', { 
                    state: { 
                        email: formData.email,
                        message: 'Registration successful! Please verify your email.'
                    } 
                });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <div className="min-h-screen flex">
                {/* Left Side - Register Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
                    <div className="w-full max-w-md">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">Create an account</h1>
                            <p className="text-gray-500">Start your journey with us today.</p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit}>
                            {/* First Name Input */}
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="Enter your first name"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondaryBlue focus:border-transparent"
                                />
                            </div>

                            {/* Last Name Input */}
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Enter your last name"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondaryBlue focus:border-transparent"
                                />
                            </div>

                            {/* Email Input */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondaryBlue focus:border-transparent"
                                />
                            </div>

                            {/* Password Input */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Create a password"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondaryBlue focus:border-transparent"
                                />
                            </div>

                            {/* Confirm Password Input */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm your password"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondaryBlue focus:border-transparent"
                                />
                            </div>

                            {/* Phone Number Input */}
                            <div>
                                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="phoneNumber"
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    placeholder="Enter a phone number"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondaryBlue focus:border-transparent"
                                />
                            </div>

                            {/* Terms & Conditions */}
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="acceptTerms"
                                        name="acceptTerms"
                                        type="checkbox"
                                        checked={acceptTerms}
                                        onChange={(e) => setAcceptTerms(e.target.checked)}
                                        className="h-4 w-4 text-teal-600 focus:ring-secondaryBlue border-gray-300 rounded"
                                    />
                                </div>
                                <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-700">
                                    I agree to the <a href="#" className="text-primaryBlue hover:secondaryBlue">Terms of Service</a> and <a href="#" className="text-primaryBlue hover:secondaryBlue">Privacy Policy</a>
                                </label>
                            </div>

                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isSubmitting ? 'bg-primaryBlue' : 'bg-primaryBlue hover:bg-secondaryBlue'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500`}
                            >
                                {isSubmitting ? 'Creating Account...' : 'Create Account'}
                            </button>

                            {/* Google Sign Up */}
                            <button
                                type="button"
                                className="w-full bg-white border border-gray-300 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 mt-4"
                            >
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19.8 10.2273C19.8 9.51819 19.7364 8.83637 19.6182 8.18182H10.2V12.05H15.6109C15.3727 13.3 14.6636 14.3591 13.6045 15.0682V17.5773H16.8273C18.7091 15.8364 19.8 13.2727 19.8 10.2273Z" fill="#4285F4" />
                                    <path d="M10.2 20C12.9 20 15.1709 19.1045 16.8273 17.5773L13.6045 15.0682C12.7091 15.6682 11.5636 16.0227 10.2 16.0227C7.59545 16.0227 5.38182 14.2636 4.58636 11.9H1.25455V14.4909C2.90182 17.7591 6.30909 20 10.2 20Z" fill="#34A853" />
                                    <path d="M4.58636 11.9C4.38636 11.3 4.27273 10.6591 4.27273 10C4.27273 9.34091 4.38636 8.7 4.58636 8.1V5.50909L1.25455 5.50909C0.572727 6.85909 0.2 8.38636 0.2 10C0.2 11.6136 0.572727 13.1409 1.25455 14.4909L4.58636 11.9Z" fill="#FBBC05" />
                                    <path d="M10.2 3.97727C11.6864 3.97727 13.0182 4.48182 14.0636 5.47273L16.9182 2.61818C15.1664 0.981818 12.8955 0 10.2 0C6.30909 0 2.90182 2.24091 1.25455 5.50909L4.58636 8.1C5.38182 5.73636 7.59545 3.97727 10.2 3.97727Z" fill="#EA4335" />
                                </svg>
                                Sign up with Google
                            </button>
                        </form>

                        {/* Sign In Link */}
                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-600">
                                Already have an account?{' '}
                                <a href="/login" className="text-primaryBlue hover:text-secondaryBlue font-medium">
                                    Sign in
                                </a>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Hero Image */}
                <div className="hidden lg:block lg:w-1/2 relative">
                    <img
                        src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&h=1000&fit=crop"
                        alt="Travel"
                        className="w-full h-full object-cover"
                    />

                    {/* Overlay Content */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-12">
                        <h2 className="text-4xl font-bold text-white mb-4">
                            Find Your Next Adventure
                        </h2>
                        <p className="text-white/90 text-md max-w-md">
                            Discover unforgettable destinations, handpicked stays, and authentic experiences around the world. Travel made simple, inspiring, and personal.
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}