import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ConfirmSignup = () => {
  const [formData, setFormData] = useState({
    username: '',
    confirmationCode: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();
  const API_ENDPOINT = process.env.REACT_APP_LAMBDA_BACKEND;
  useEffect(() => {
    // Get username from localStorage
    const username = localStorage.getItem('signupUsername');
    if (username) {
      setFormData(prev => ({ ...prev, username }));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_ENDPOINT}/api/auth/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          confirmationCode: formData.confirmationCode
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Confirmation failed');
      }

      setSuccess('Account confirmed successfully! Redirecting to login...');
      
      // Clear the stored username
      localStorage.removeItem('signupUsername');
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setError(error.message || 'Confirmation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!formData.username) {
      setError('Username is required to resend code');
      return;
    }

    setResendLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_ENDPOINT}/api/auth/resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend code');
      }

      setSuccess('Verification code resent successfully. Please check your email.');
    } catch (error) {
      setError(error.message || 'Failed to resend code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Confirm Your Account</h1>
            <p className="text-gray-600 mt-2">
              Enter the verification code sent to your email
            </p>
          </div>
          
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}
          
          {success && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {success}
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="username">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  id="username"
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="confirmationCode">
                Confirmation Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  id="confirmationCode"
                  type="text"
                  name="confirmationCode"
                  placeholder="Enter verification code"
                  value={formData.confirmationCode}
                  onChange={handleChange}
                  required
                />
              </div>
              <p className="text-gray-500 text-xs mt-1 ml-1">
                Please enter the verification code sent to your email.
              </p>
            </div>
            
            <div>
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Confirming...
                  </div>
                ) : 'Confirm Account'}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendLoading}
              className="mt-4 text-blue-600 hover:text-blue-500 font-medium text-sm"
            >
              {resendLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </div>
              ) : 'Resend confirmation code'}
            </button>
            
            <p className="mt-4 text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Right side - Image and Info */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-800 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white opacity-10 rounded-full animate-pulse" style={{ animationDuration: '4s' }}></div>
          <div className="absolute top-3/4 left-1/2 w-24 h-24 bg-white opacity-10 rounded-full animate-pulse" style={{ animationDuration: '6s' }}></div>
          <div className="absolute top-1/2 left-3/4 w-40 h-40 bg-white opacity-10 rounded-full animate-pulse" style={{ animationDuration: '8s' }}></div>
          <div className="absolute bottom-[625px] ml-[700px] w-52 h-52 bg-white opacity-10 rounded-full animate-pulse" style={{ animationDuration: '9s' }}></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center h-full p-8 text-white">
          <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold mb-6">AI-Driven Cloud Support and Incident Management</h2>
            <p className="mb-8">
              A comprehensive solution for detecting, analyzing, and remediating cloud security incidents using advanced AI capabilities with Amazon Bedrock's Claude model.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm">
                <div className="flex items-center mb-2">
                  <div className="h-2 w-2 bg-red-400 rounded-full mr-2"></div>
                  <span className="font-semibold">Incident Management</span>
                </div>
                <p className="text-sm">Real-time monitoring with Freshservice API and Freshservice Dashboard</p>
              </div>
              
              <div className="bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm">
                <div className="flex items-center mb-2">
                  <div className="h-2 w-2 bg-blue-400 rounded-full mr-2"></div>
                  <span className="font-semibold">AI Analysis</span>
                </div>
                <p className="text-sm">Dynamic remediation with Bedrock Claude model</p>
              </div>
              
              <div className="bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm">
                <div className="flex items-center mb-2">
                  <div className="h-2 w-2 bg-yellow-400 rounded-full mr-2"></div>
                  <span className="font-semibold">Auto Remediation</span>
                </div>
                <p className="text-sm">Intelligent security incident resolution</p>
              </div>
            </div>

            <div className="bg-white bg-opacity-10 p-5 rounded-lg backdrop-blur-sm mb-8">
              <h3 className="font-bold text-lg mb-3">Account Verification</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="inline-block h-5 w-5 rounded-full bg-green-400 bg-opacity-20 flex-shrink-0 mr-2 mt-0.5 flex items-center justify-center text-xs">1</span>
                  <span>Check your email for the verification code</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block h-5 w-5 rounded-full bg-green-400 bg-opacity-20 flex-shrink-0 mr-2 mt-0.5 flex items-center justify-center text-xs">2</span>
                  <span>Enter the code to confirm your account</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block h-5 w-5 rounded-full bg-green-400 bg-opacity-20 flex-shrink-0 mr-2 mt-0.5 flex items-center justify-center text-xs">3</span>
                  <span>Access the platform's full security features</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block h-5 w-5 rounded-full bg-green-400 bg-opacity-20 flex-shrink-0 mr-2 mt-0.5 flex items-center justify-center text-xs">4</span>
                  <span>Start protecting your cloud infrastructure</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmSignup;