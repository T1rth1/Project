import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShieldAlt, 
  faBell, 
  faSearch, 
  faSun, 
  faMoon, 
  faSignOutAlt,
  faUser,
  faCog
} from '@fortawesome/free-solid-svg-icons';

export default function Header({ darkMode, toggleDarkMode }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userName, setUserName] = useState('User');
  const [email, setEmail] = useState('Email')
  const [userInitials, setUserInitials] = useState('U');
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const navigate = useNavigate();


  useEffect(() => {
    // Get user info from local storage
    const name = localStorage.getItem('name') || sessionStorage.getItem('name');
    const email = sessionStorage.getItem('email')
    if (name) {
      setUserName(name);
      // Get initials from name (first letter of first and last name)
      const initials = name.split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
      setUserInitials(initials);
    }
    if(email){
      setEmail(email);
    }

    // Close dropdown when clicking outside
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = () => {
    // Clear all local storage and session storage
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload()
    // Redirect to login page
    navigate('/login');
  };

  return (
    <header className="bg-gradient-to-r from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 shadow-lg z-10 border-b border-blue-100 dark:border-gray-700 py-3">
      <div className="max-w-7xl ml-8">
        <div className="flex items-center justify-between h-18">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <img 
                src="https://www.cloudthat.com/training/wp-content/themes/masterstudy-child/newfiles/images/CT-logo.png" 
                alt="CloudThat Logo" 
                className="h-7 mr-3 transition-all duration-300 hover:opacity-90" 
              />
              <div className="h-8 w-0.5 bg-blue-200 dark:bg-blue-700 mx-2"></div>
              <div className="flex items-center">
                <FontAwesomeIcon 
                  icon={faShieldAlt} 
                  className="text-2xl text-blue-600 dark:text-blue-400 mr-2 animate-pulse" 
                  style={{ animationDuration: '3s' }}
                />
                <h1 className="text-xl font-bold text-gray-800 dark:text-white tracking-wide bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent">
                  AI-Driven Cloud Support and Incident Management Platform
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {/* Dark Mode Toggle with improved styling */}
            {/* <button 
              onClick={toggleDarkMode}
              className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-gray-600 transition-all duration-300 shadow-sm hover:shadow-md"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            > */}
              {/* <FontAwesomeIcon 
                icon={darkMode ? faSun : faMoon} 
                className={`text-lg ${darkMode ? 'text-yellow-400' : 'text-blue-600'}`}
              /> */}
            {/* </button> */}

            {/* User Profile with enhanced styling */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-3 focus:outline-none group"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-md group-hover:shadow-lg transition-all duration-300 border-2 border-white dark:border-gray-700">
                  {userInitials}
                </div>
                <div className="hidden md:block">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                    {userName}
                  </span>
                  {/* <p className="text-xs text-gray-500 dark:text-gray-400">
                    Administrator
                  </p> */}
                </div>
                <svg className="w-4 h-4 ml-1 text-gray-400 dark:text-gray-300 group-hover:text-blue-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              {/* User Dropdown with enhanced styling */}
              {showDropdown && (
                <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl py-2 z-10 border border-gray-100 dark:border-gray-700 transform transition-all duration-300 ease-in-out">
                  <div className="px-4 py-3 border-b border-gray-300 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{userName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{email}</p>
                  </div>
                  <a href="settings" className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-200">
                    <FontAwesomeIcon icon={faUser} className="mr-3 text-blue-500 dark:text-blue-400" />
                    <span>Profile Settings</span>
                  </a>
                  <div className="border-t border-gray-300 dark:border-gray-700 my-1"></div>
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-3" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}