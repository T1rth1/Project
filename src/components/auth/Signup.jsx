import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmpassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  const navigate = useNavigate();
  const API_ENDPOINT = process.env.REACT_APP_LAMBDA_BACKEND;
  // Add background animation effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      
      document.documentElement.style.setProperty('--mouse-x', x);
      document.documentElement.style.setProperty('--mouse-y', y);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Check password strength
  useEffect(() => {
    const password = formData.password;
    
    // Check individual requirements
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };
    
    setPasswordChecks(checks);
    
    // Calculate strength (0-4)
    const strength = Object.values(checks).filter(Boolean).length;
    setPasswordStrength(strength);
    
  }, [formData.password]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate password match
    if (formData.password !== formData.confirmpassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (passwordStrength < 3) {
      setError('Please create a stronger password');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINT}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          confirmpassword: formData.confirmpassword
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // Store username for confirmation page
      localStorage.setItem('signupUsername', formData.username);
      
      // Navigate to confirmation page
      navigate('/confirm-signup');
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get color for password strength bar
  const getStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-200';
    if (passwordStrength === 1) return 'bg-red-500';
    if (passwordStrength === 2) return 'bg-orange-500';
    if (passwordStrength === 3) return 'bg-yellow-500';
    if (passwordStrength === 4) return 'bg-green-500';
    return 'bg-blue-500';
  };

  // Get text for password strength
  const getStrengthText = () => {
    if (passwordStrength === 0) return 'None';
    if (passwordStrength === 1) return 'Very Weak';
    if (passwordStrength === 2) return 'Weak';
    if (passwordStrength === 3) return 'Medium';
    if (passwordStrength === 4) return 'Strong';
    return 'Very Strong';
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Signup Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <img src="https://www.cloudthat.com/training/wp-content/themes/masterstudy-child/newfiles/images/CT-logo.png" alt="CloudThat Logo" className="h-10 mb-8" />
            <h2 className="text-2xl font-bold text-gray-800">Create an Account</h2>
            <p className="text-gray-600">Join CloudThat today</p>
          </div>
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-md">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="name">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
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
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    tabIndex="-1"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Password strength meter */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">Password Strength:</span>
                    <span className={`text-xs font-medium ${passwordStrength >= 3 ? 'text-green-600' : 'text-red-600'}`}>
                      {getStrengthText()}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getStrengthColor()} transition-all duration-300 ease-in-out`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    ></div>
                  </div>
                  
                  {/* Password requirements checklist */}
                  <ul className="mt-2 space-y-1 text-xs text-gray-500">
                    <li className={`flex items-center ${passwordChecks.length ? 'text-green-600' : ''}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 mr-1 ${passwordChecks.length ? 'text-green-600' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      At least 8 characters
                    </li>
                    <li className={`flex items-center ${passwordChecks.uppercase ? 'text-green-600' : ''}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 mr-1 ${passwordChecks.uppercase ? 'text-green-600' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      At least one uppercase letter
                    </li>
                    <li className={`flex items-center ${passwordChecks.lowercase ? 'text-green-600' : ''}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 mr-1 ${passwordChecks.lowercase ? 'text-green-600' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      At least one lowercase letter
                    </li>
                    <li className={`flex items-center ${passwordChecks.number ? 'text-green-600' : ''}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 mr-1 ${passwordChecks.number ? 'text-green-600' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      At least one number
                    </li>
                    <li className={`flex items-center ${passwordChecks.special ? 'text-green-600' : ''}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 mr-1 ${passwordChecks.special ? 'text-green-600' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      At least one special character
                    </li>
                  </ul>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="confirmpassword">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  id="confirmpassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmpassword"
                  placeholder="Confirm your password"
                  value={formData.confirmpassword}
                  onChange={handleChange}
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    tabIndex="-1"
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              {formData.confirmpassword && formData.password !== formData.confirmpassword && (
                <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
              )}
            </div>
            
            <div className="pt-2">
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                type="submit"
                disabled={loading || passwordStrength < 3 || formData.password !== formData.confirmpassword}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing up...
                  </div>
                ) : 'Sign Up'}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-200 text-gray-500">or</span>
              </div>
            </div>
            
            <p className="mt-6 text-sm text-gray-600">
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
              <h3 className="font-bold text-lg mb-3">End-to-End Workflow</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="inline-block h-5 w-5 rounded-full bg-green-400 bg-opacity-20 flex-shrink-0 mr-2 mt-0.5 flex items-center justify-center text-xs">1</span>
                  <span>Detect threats with AWS security services</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block h-5 w-5 rounded-full bg-green-400 bg-opacity-20 flex-shrink-0 mr-2 mt-0.5 flex items-center justify-center text-xs">2</span>
                  <span>Process incidents with Lambda functions</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block h-5 w-5 rounded-full bg-green-400 bg-opacity-20 flex-shrink-0 mr-2 mt-0.5 flex items-center justify-center text-xs">3</span>
                  <span>Analyze with Claude AI for dynamic remediation</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block h-5 w-5 rounded-full bg-green-400 bg-opacity-20 flex-shrink-0 mr-2 mt-0.5 flex items-center justify-center text-xs">4</span>
                  <span>Execute approved security actions automatically</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;