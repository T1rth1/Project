import { useState, useEffect } from 'react'; 
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'; 
import Header from './components/Header'; 
import Sidebar from './components/Sidebar'; 
import Dashboard from './components/Dashboard'; 
import IncidentManagement from './components/IncidentManagement'; 
import UserManagement from './components/UserManagement'; 
import Settings from './components/Settings'; 
import Login from './components/auth/Login'; 
import Signup from './components/auth/Signup'; 
import { Toaster } from 'react-hot-toast';
import ForgotPassword from './components/auth/ForgotPassword'
import ConfirmSignup from './components/auth/ConfirmSignup'; 
// ... existing code ...
import './index.css'; 
// import { CfnUserProfile } from 'aws-cdk-lib/aws-sagemaker';
import ProfilePage from './components/auth/ProfilePage';

function App() { 
  const [darkMode, setDarkMode] = useState(false); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = () => {
      const token = sessionStorage.getItem('idToken');
      setIsAuthenticated(!!token);
      setIsLoading(false);
    };
    
    checkAuth();
    
    // Optional: Add event listener to detect sessionStorage changes
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);
  
  const toggleDarkMode = () => { 
    setDarkMode(!darkMode); 
  }; 
  
  console.log("auth", isAuthenticated);
  
  // Show loading state while checking authentication
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return ( 
    <>
    <Toaster position="top-right" reverseOrder={false} />
    <Router> 
      <div className={`${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}> 
        {isAuthenticated ? ( 
          <div className="flex h-screen"> 
            <Sidebar /> 
            <div className="flex-1 flex flex-col overflow-hidden"> 
              <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} /> 
              <main className="flex-1 overflow-y-auto p-4 bg-gradient-to-r from-white to-blue-50"> 
                <Routes> 
                  <Route path="/dashboard" element={<Dashboard/>}/> 
                  {/* <Route path="/incidents" element={<IncidentManagement/>} />  */}
                  <Route path="/users" element={<UserManagement/>} /> 
                  <Route path="/settings" element={<Settings/>} /> 
                  <Route path="/profile" element={<ProfilePage />} /> 
                  
                  {/* Redirect authenticated users to dashboard if they try to access auth pages */}
                  <Route path="/login" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/signup" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/confirm-signup" element={<Navigate to="/dashboard" replace />} />
                  
                  {/* Redirect to dashboard by default for authenticated users */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes> 
              </main> 
            </div> 
          </div> 
        ) : ( 
          <div className="min-h-screen"> 
            <Routes> 
                <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} /> 
                <Route path="/signup" element={<Signup />} /> 
                <Route path="/confirm-signup" element={<ConfirmSignup />} /> 
                <Route path="/forgot-password" element={<ForgotPassword />} /> 

                
                {/* Redirect unauthenticated users to login */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes> 
          </div> 
        )} 
      </div> 
    </Router> 
    </>
  ); 
} 

export default App;