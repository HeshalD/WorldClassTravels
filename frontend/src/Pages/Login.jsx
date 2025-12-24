import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import malaysiaImage from '../Images/malaysia1.jpg';
import Footer from '../Components/Footer';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        // Redirect to home if already logged in
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        
        try {
            const response = await authAPI.login(email, password);
            
            if (response.data.status === 'success') {
                const { token, data: { user } } = response.data;
                
                // Store token and user ID in localStorage
                localStorage.setItem('token', token);
                
                // Store user data in context
                login(user);
                
                // Show success message
                toast.success('Login successful!');
                
                // Redirect to home page
                navigate('/');
            } else {
                throw new Error(response.data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to login. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="min-h-screen flex">
                {/* Left Side - Login Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
                    <div className="w-full max-w-md">

                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back</h1>
                            <p className="text-gray-500">Welcome back! Please enter your details.</p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Input */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Remember for 30 days</span>
                                </label>
                                <Link to="/forgot-password" className="text-teal-700 hover:text-teal-800 font-medium">
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Sign In Button */}
                            <button
                                type="submit"
                                className="w-full bg-primaryBlue hover:bg-secondaryBlue uppercase text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-70 flex items-center justify-center"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing in...
                                    </>
                                ) : 'Sign in'}
                            </button>

                            {/* Google Sign In */}
                            <button
                                type="button"
                                className="w-full bg-white border border-gray-300 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
                            >
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19.8 10.2273C19.8 9.51819 19.7364 8.83637 19.6182 8.18182H10.2V12.05H15.6109C15.3727 13.3 14.6636 14.3591 13.6045 15.0682V17.5773H16.8273C18.7091 15.8364 19.8 13.2727 19.8 10.2273Z" fill="#4285F4" />
                                    <path d="M10.2 20C12.9 20 15.1709 19.1045 16.8273 17.5773L13.6045 15.0682C12.7091 15.6682 11.5636 16.0227 10.2 16.0227C7.59545 16.0227 5.38182 14.2636 4.58636 11.9H1.25455V14.4909C2.90182 17.7591 6.30909 20 10.2 20Z" fill="#34A853" />
                                    <path d="M4.58636 11.9C4.38636 11.3 4.27273 10.6591 4.27273 10C4.27273 9.34091 4.38636 8.7 4.58636 8.1V5.50909H1.25455C0.572727 6.85909 0.2 8.38636 0.2 10C0.2 11.6136 0.572727 13.1409 1.25455 14.4909L4.58636 11.9Z" fill="#FBBC05" />
                                    <path d="M10.2 3.97727C11.6864 3.97727 13.0182 4.48182 14.0636 5.47273L16.9182 2.61818C15.1664 0.981818 12.8955 0 10.2 0C6.30909 0 2.90182 2.24091 1.25455 5.50909L4.58636 8.1C5.38182 5.73636 7.59545 3.97727 10.2 3.97727Z" fill="#EA4335" />
                                </svg>
                                Sign in with Google
                            </button>
                        </form>

                        {/* Sign Up Link */}
                        <div className="mt-8 text-center relative">
                            <p className="text-sm text-gray-600 relative z-10">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-primaryBlue hover:text-secondaryBlue font-medium">
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Hero Image */}
                <div className="hidden lg:block lg:w-1/2 relative">
                    <img
                        src={malaysiaImage}
                        alt="img1"
                        className="w-full h-full object-cover"
                    />

                    {/* Overlay Content */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-12">
                        {/* Trust Badge 
          <div className="flex items-center gap-2 mb-6">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>
              <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white"></div>
              <div className="w-8 h-8 rounded-full bg-gray-500 border-2 border-white"></div>
            </div>
            <span className="text-white text-sm">Trusted by over 10,000 travelers</span>
          </div>*/}

                        {/* Main Heading */}
                        <h2 className="text-4xl font-bold text-white mb-4">
                            Find Your Next Adventure
                        </h2>

                        {/* Description */}
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