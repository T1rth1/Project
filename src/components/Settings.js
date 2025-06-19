import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMoon, 
  faSun, 
  faBell, 
  faEnvelope, 
  faSync, 
  faUser, 
  faLock, 
  faCheck, 
  faTimes 
} from '@fortawesome/free-solid-svg-icons';

export default function Settings() {
  const navigate = useNavigate();
  
  // Theme settings
  const [darkMode, setDarkMode] = useState(false);
  
  // Notification settings
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  
  // Data refresh settings
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5);
  
  // User profile settings
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameChangeSuccess, setNameChangeSuccess] = useState(false);
  const [nameChangeError, setNameChangeError] = useState('');
  
  // Password reset
  const [passwordResetStep, setPasswordResetStep] = useState(0); // 0: not resetting, 1: request code, 2: confirm code
  const [passwordResetData, setPasswordResetData] = useState({
    username: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetError, setResetError] = useState('');
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  
  // API endpoint
  const API_ENDPOINT = process.env.REACT_APP_LAMBDA_BACKEND;

  useEffect(() => {
    // Load user data from sessionStorage
    const storedName = sessionStorage.getItem('name') || '';
    const storedEmail = sessionStorage.getItem('email') || '';
    const storedDarkMode = sessionStorage.getItem('darkMode') === 'true';
    
    setUserName(storedName);
    setEmail(storedEmail);
    setDarkMode(storedDarkMode);
    setNewName(storedName);
    setPasswordResetData(prev => ({
      ...prev,
      username: storedEmail
    }));
    
    // Apply dark mode if enabled
    if (storedDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Handle password reset form changes
  const handlePasswordResetChange = (e) => {
    setPasswordResetData({
      ...passwordResetData,
      [e.target.name]: e.target.value
    });
  };

  // Toggle dark mode
  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    sessionStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Handle name change
  const handleNameChange = async (e) => {
    e.preventDefault();
    
    if (!newName.trim()) {
      setNameChangeError('Name cannot be empty');
      return;
    }
    
    setIsLoading(true);
    setNameChangeError('');
    
    try {
      const uid = sessionStorage.getItem('id');
      
      const response = await fetch(`${API_ENDPOINT}/api/auth/changeName`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid,
          email,
          newName
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update name');
      }
      
      setUserName(newName);
      sessionStorage.setItem('name', newName);
      setNameChangeSuccess(true);
      setIsEditingName(false);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setNameChangeSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error updating name:', error);
      setNameChangeError(error.message || 'Failed to update name');
    } finally {
      setIsLoading(false);
    }
  };

  // Request password reset code
  const requestResetCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResetError('');
    setResetSuccess('');

    // Validate username
    if (!passwordResetData.username) {
      setResetError('Email is required');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINT}/api/auth/forgotpassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: passwordResetData.username
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send verification code');
      }

      setResetSuccess('Verification code has been sent to your email.');
      setPasswordResetStep(2); // Move to confirmation step
    } catch (error) {
      console.error('Error requesting reset code:', error);
      setResetError(error.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm password reset
  const confirmPasswordReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResetError('');
    setResetSuccess('');

    // Validate all fields
    if (!passwordResetData.username || !passwordResetData.code || !passwordResetData.newPassword) {
      setResetError('All fields are required');
      setIsLoading(false);
      return;
    }

    // Validate password match
    if (passwordResetData.newPassword !== passwordResetData.confirmPassword) {
      setResetError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINT}/api/auth/confirmforgotpassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: passwordResetData.username,
          code: passwordResetData.code,
          newPassword: passwordResetData.newPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      setResetSuccess('Password has been reset successfully!');
      
      // Reset form and close after 3 seconds
      setTimeout(() => {
        setPasswordResetStep(0);
        setPasswordResetData({
          username: email,
          code: '',
          newPassword: '',
          confirmPassword: ''
        });
        setResetSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Error confirming password reset:', error);
      setResetError(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel password reset
  const cancelPasswordReset = () => {
    setPasswordResetStep(0);
    setPasswordResetData({
      username: email,
      code: '',
      newPassword: '',
      confirmPassword: ''
    });
    setResetError('');
    setResetSuccess('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Settings</h1>
      
      {/* User Profile Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            <FontAwesomeIcon icon={faUser} className="mr-2 text-blue-500" />
            User Profile
          </h2>
        </div>
        
        <div className="space-y-6">
          {/* Display Name */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-700 dark:text-gray-300 font-medium">Display Name</h3>
                {!isEditingName ? (
                  <p className="text-gray-900 dark:text-white text-lg font-semibold mt-1">{userName}</p>
                ) : (
                  <form onSubmit={handleNameChange} className="mt-2">
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter new name"
                      />
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50"
                      >
                        {isLoading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingName(false);
                          setNewName(userName);
                          setNameChangeError('');
                        }}
                        className="ml-2 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                    {nameChangeError && (
                      <p className="mt-2 text-red-600 dark:text-red-400 text-sm">{nameChangeError}</p>
                    )}
                  </form>
                )}
              </div>
              
              {!isEditingName && (
                <button
                  onClick={() => setIsEditingName(true)}
                  className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Edit
                </button>
              )}
            </div>
            
            {nameChangeSuccess && (
              <div className="mt-2 flex items-center text-green-600 dark:text-green-400">
                <FontAwesomeIcon icon={faCheck} className="mr-1" />
                <span className="text-sm">Name updated successfully!</span>
              </div>
            )}
          </div>
          
          {/* Email Address */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h3 className="text-gray-700 dark:text-gray-300 font-medium">Email Address</h3>
            <p className="text-gray-900 dark:text-white text-lg font-semibold mt-1">{email}</p>
          </div>
          
          {/* Password Reset */}
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-gray-700 dark:text-gray-300 font-medium">Password</h3>
              
              {passwordResetStep === 0 && (
                <button
                  onClick={() => setPasswordResetStep(1)}
                  className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Reset Password
                </button>
              )}
            </div>
            
            {/* Password Reset Step 1: Request Code */}
            {passwordResetStep === 1 && (
              <form onSubmit={requestResetCode} className="mt-3">
                <div className="flex flex-col space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    We'll send a verification code to your email address.
                  </p>
                  <div className="flex items-center">
                    <input
                      type="email"
                      name="username"
                      value={passwordResetData.username}
                      onChange={handlePasswordResetChange}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Confirm your email"
                    />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50"
                    >
                      {isLoading ? 'Sending...' : 'Send Code'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelPasswordReset}
                      className="ml-2 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                  {resetError && (
                    <p className="text-red-600 dark:text-red-400 text-sm">{resetError}</p>
                  )}
                </div>
              </form>
            )}
            
            {/* Password Reset Step 2: Confirm Code and Set New Password */}
            {passwordResetStep === 2 && (
              <form onSubmit={confirmPasswordReset} className="mt-3">
                <div className="flex flex-col space-y-3">
                  <div className="mb-3">
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={passwordResetData.code}
                      onChange={handlePasswordResetChange}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white w-full"
                      placeholder="Enter verification code"
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordResetData.newPassword}
                      onChange={handlePasswordResetChange}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white w-full"
                      placeholder="Enter new password"
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordResetData.confirmPassword}
                      onChange={handlePasswordResetChange}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white w-full"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50"
                    >
                      {isLoading ? 'Resetting...' : 'Reset Password'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPasswordResetStep(1)}
                      className="ml-2 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={cancelPasswordReset}
                      className="ml-2 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                  
                  {resetError && (
                    <p className="text-red-600 dark:text-red-400 text-sm">{resetError}</p>
                  )}
                </div>
              </form>
            )}
            
            {resetSuccess && (
              <div className="mt-2 flex items-center text-green-600 dark:text-green-400">
                <FontAwesomeIcon icon={faCheck} className="mr-1" />
                <span className="text-sm">{resetSuccess}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Appearance Section
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8 transition-all duration-300">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          <FontAwesomeIcon icon={darkMode ? faMoon : faSun} className="mr-2 text-blue-500" />
          Appearance
        </h2>
        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-gray-900 dark:text-white font-medium">Dark Mode</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark theme</p>
          </div>
          <button
            onClick={handleDarkModeToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${darkMode ? 'bg-blue-600' : 'bg-gray-200'}`}
            aria-label="Toggle dark mode"
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div> */}

      {/* Notifications Section */}
      {/* <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8 transition-all duration-300">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          <FontAwesomeIcon icon={faBell} className="mr-2 text-blue-500" />
          Notifications
        </h2>
        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-gray-900 dark:text-white font-medium">In-app Notifications</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Enable or disable notification popups</p>
          </div>
          <button
            onClick={() => setNotifications(!notifications)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${notifications ? 'bg-blue-600' : 'bg-gray-200'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${notifications ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
        <div className="flex items-center justify-between py-3">
          <div>
            <h3 className="text-gray-900 dark:text-white font-medium">Email Alerts</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Receive critical alerts via email</p>
          </div>
          <button
            onClick={() => setEmailAlerts(!emailAlerts)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${emailAlerts ? 'bg-blue-600' : 'bg-gray-200'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${emailAlerts ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div> */}

      {/* Data Refresh Section */}
      {/* <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-all duration-300">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          <FontAwesomeIcon icon={faSync} className="mr-2 text-blue-500" />
          Data Refresh
        </h2>
        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-gray-900 dark:text-white font-medium">Auto Refresh</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Automatically refresh dashboard data</p>
          </div>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${autoRefresh ? 'bg-blue-600' : 'bg-gray-200'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${autoRefresh ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
        {autoRefresh && (
          <div className="py-3">
            <h3 className="text-gray-900 dark:text-white font-medium mb-2">Refresh Interval (minutes)</h3>
            <div className="flex items-center">
              <input
                type="range"
                min="1"
                max="30"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <span className="ml-3 w-10 text-center text-gray-900 dark:text-white font-medium">
                {refreshInterval}
              </span>
            </div>
            <div className="text-right text-sm text-gray-500 dark:text-gray-400 mt-1">
              {refreshInterval} minute{refreshInterval !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div> */}
    </div>
  );
}