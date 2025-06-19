import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // Step 1: Request code, Step 2: Confirm code
  const [formData, setFormData] = useState({
    username: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  const navigate = useNavigate();
  const API_ENDPOINT = process.env.REACT_APP_LAMBDA_BACKEND;
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Check password strength if the field is newPassword
    if (name === 'newPassword') {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const requestResetCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate username
    if (!formData.username) {
      setError('Username is required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINT}/api/auth/forgotpassword`, {
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
        throw new Error(data.message || 'Failed to send verification code');
      }

      setSuccess('Verification code has been sent to your email.');
      setStep(2); // Move to confirmation step
    } catch (error) {
      setError(error.message || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const confirmPasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate all fields
    if (!formData.username || !formData.code || !formData.newPassword) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    // Validate password match
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Check if password meets requirements
    const isPasswordStrong = Object.values(passwordStrength).every(value => value);
    if (!isPasswordStrong) {
      setError('Password does not meet all requirements');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINT}/api/auth/confirmforgotpassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          code: formData.code,
          newPassword: formData.newPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      setSuccess('Password has been reset successfully!');
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setError(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              {step === 1 ? 'Forgot Password' : 'Reset Password'}
            </h1>
            <p className="text-gray-600 mt-2">
              {step === 1 
                ? 'Enter your username to receive a verification code' 
                : 'Enter the verification code and create a new password'}
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
          
          {step === 1 ? (
            <form onSubmit={requestResetCode} className="space-y-6">
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
                      Sending...
                    </div>
                  ) : 'Send Verification Code'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={confirmPasswordReset} className="space-y-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="code">
                  Verification Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    id="code"
                    type="text"
                    name="code"
                    placeholder="Enter verification code"
                    value={formData.code}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="newPassword">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    placeholder="Create new password"
                    value={formData.newPassword}
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
              </div>
              
              {/* Password strength checklist */}
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm font-medium text-gray-700 mb-2">Password must contain:</p>
                <ul className="space-y-1">
                  <li className="flex items-center text-sm">
                    <span className={`inline-block w-4 h-4 mr-2 rounded-full ${passwordStrength.length ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    At least 8 characters
                  </li>
                  <li className="flex items-center text-sm">
                    <span className={`inline-block w-4 h-4 mr-2 rounded-full ${passwordStrength.uppercase ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    At least one uppercase letter
                  </li>
                  <li className="flex items-center text-sm">
                    <span className={`inline-block w-4 h-4 mr-2 rounded-full ${passwordStrength.lowercase ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    At least one lowercase letter
                  </li>
                  <li className="flex items-center text-sm">
                    <span className={`inline-block w-4 h-4 mr-2 rounded-full ${passwordStrength.number ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    At least one number
                  </li>
                  <li className="flex items-center text-sm">
                    <span className={`inline-block w-4 h-4 mr-2 rounded-full ${passwordStrength.special ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    At least one special character
                  </li>
                </ul>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="confirmPassword">
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
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
                {formData.newPassword && formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
                )}
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
                      Resetting...
                    </div>
                  ) : 'Reset Password'}
                </button>
              </div>
            </form>
          )}
          
          <div className="mt-6 text-center">
            <div className="flex items-center justify-between">
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Back to Request Code
                </button>
              )}
              <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                Back to Login
              </Link>
            </div>
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
              <h3 className="font-bold text-lg mb-3">Password Security Tips</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="inline-block h-5 w-5 rounded-full bg-green-400 bg-opacity-20 flex-shrink-0 mr-2 mt-0.5 flex items-center justify-center text-xs">1</span>
                  <span>Use a unique password for each account</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block h-5 w-5 rounded-full bg-green-400 bg-opacity-20 flex-shrink-0 mr-2 mt-0.5 flex items-center justify-center text-xs">2</span>
                  <span>Combine letters, numbers, and special characters</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block h-5 w-5 rounded-full bg-green-400 bg-opacity-20 flex-shrink-0 mr-2 mt-0.5 flex items-center justify-center text-xs">3</span>
                  <span>Avoid using personal information in passwords</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block h-5 w-5 rounded-full bg-green-400 bg-opacity-20 flex-shrink-0 mr-2 mt-0.5 flex items-center justify-center text-xs">4</span>
                  <span>Consider using a password manager for security</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;