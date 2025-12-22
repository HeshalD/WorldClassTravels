import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

export default function RegistrationOTPVerification() {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [countdown, setCountdown] = useState(60);
    const [isResendDisabled, setIsResendDisabled] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            navigate('/register');
            return;
        }

        // Start countdown for resend OPP
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setIsResendDisabled(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [email, navigate]);

    const handleOtpChange = (element, index) => {
        if (isNaN(element.value)) return false;
        
        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);
        
        // Auto-focus next input
        if (element.nextSibling && element.value !== '') {
            element.nextSibling.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !e.target.value && e.target.previousSibling) {
            e.target.previousSibling.focus();
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const otpCode = otp.join('');
        
        if (otpCode.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await authAPI.verifyRegistrationOtp({ 
                email, 
                otp: otpCode 
            });
            
            if (response.data && response.data.token) {
                // Store token and user data
                localStorage.setItem('token', response.data.token);
                
                // Show success message
                toast.success('Email verified successfully! Redirecting...');
                
                // Redirect to home after a short delay
                setTimeout(() => {
                    navigate('/');
                }, 1500);
            } else {
                setError('Invalid response from server. Please try again.');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Verification failed. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendOtp = async () => {
        try {
            setMessage('Sending new OTP...');
            setError('');
            setIsResendDisabled(true);
            
            // Call the resend OTP endpoint
            const response = await authAPI.resendRegistrationOtp({ email });
            
            if (response.data && response.data.message) {
                setMessage(response.data.message);
                toast.success('New OTP sent successfully!');
            } else {
                setMessage('A new OTP has been sent to your email');
                toast.success('New OTP sent successfully!');
            }
            
            // Reset countdown
            setCountdown(60);
            
            // Restart countdown
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setIsResendDisabled(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to resend OTP. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage);
            setIsResendDisabled(false);
        }
    };

    if (!email) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-lg shadow-md">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                        <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h2 className="mt-3 text-2xl font-bold text-gray-900">
                        Verify Your Email
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        We've sent a verification code to <span className="font-medium">{email}</span>
                    </p>
                    {message && (
                        <p className="mt-2 text-sm text-green-600">{message}</p>
                    )}
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

                {message && (
                    <div className="bg-green-50 border-l-4 border-green-400 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-green-700">{message}</p>
                            </div>
                        </div>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
                    <div className="flex justify-center space-x-2">
                        {otp.map((data, index) => (
                            <input
                                key={index}
                                type="text"
                                maxLength="1"
                                value={data}
                                onChange={(e) => handleOtpChange(e.target, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                className="w-12 h-12 text-center text-2xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondaryBlue focus:border-transparent"
                            />
                        ))}
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white ${isSubmitting ? 'bg-blue-400' : 'bg-primaryBlue hover:bg-secondaryBlue'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                        >
                            {isSubmitting ? 'Verifying...' : 'Verify OTP'}
                        </button>
                    </div>
                </form>

                <div className="text-center text-sm">
                    <p className="text-gray-600">
                        Didn't receive the code?{' '}
                        <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={isResendDisabled}
                            className={`font-medium ${isResendDisabled ? 'text-gray-400' : 'text-primaryBlue hover:text-secondaryBlue'}`}
                        >
                            {isResendDisabled ? `Resend OTP (${countdown}s)` : 'Resend OTP'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
