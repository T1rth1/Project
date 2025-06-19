import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: 'johndoe',
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    bio: 'Software developer passionate about creating amazing user experiences.',
    location: 'San Francisco, CA',
    website: 'https://johndoe.dev',
    avatar: 'https://avatar.iran.liara.run/username?username=johndoe'
  });
  const [formData, setFormData] = useState({...profileData});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API_ENDPOINT = process.env.REACT_APP_LAMBDA_BACKEND;
  useEffect(() => {
    // Fetch user profile data
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINT}/api/user/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }

      const data = await response.json();
      setProfileData(data);
      setFormData(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // For demo purposes, we'll continue with the default data
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing, revert to original data
      setFormData({...profileData});
    }
    setIsEditing(!isEditing);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // This would be replaced with your actual API endpoint
      const response = await fetch(`${API_ENDPOINT}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setProfileData(formData);
      setSuccess('Profile updated successfully!');
      
      // Exit edit mode after successful update
      setTimeout(() => {
        setIsEditing(false);
        setSuccess('');
      }, 2000);
    } catch (error) {
      setError(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm p-8 rounded-xl shadow-xl w-full max-w-3xl border border-gray-200">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Your Profile
          </h2>
          <button
            onClick={handleEditToggle}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              isEditing 
                ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
            }`}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md">
            <p className="font-medium">Success</p>
            <p>{success}</p>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <img 
                  src={profileData.avatar || `https://avatar.iran.liara.run/username?username=${profileData.username}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              {isEditing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button className="text-white font-medium">
                    Change Photo
                  </button>
                </div>
              )}
            </div>
            {!isEditing && (
              <div className="mt-4 text-center">
                <h3 className="text-xl font-bold text-gray-800">{profileData.fullName}</h3>
                <p className="text-gray-600">@{profileData.username}</p>
              </div>
            )}
          </div>

          {/* Profile Details Section */}
          <div className="flex-1">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                      Username
                    </label>
                    <input
                      className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      id="username"
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fullName">
                      Full Name
                    </label>
                    <input
                      className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      id="fullName"
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                      Email
                    </label>
                    <input
                      className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
                      Location
                    </label>
                    <input
                      className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      id="location"
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="website">
                      Website
                    </label>
                    <input
                      className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      id="website"
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bio">
                    Bio
                  </label>
                  <textarea
                    className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    id="bio"
                    name="bio"
                    rows="4"
                    value={formData.bio}
                    onChange={handleChange}
                  ></textarea>
                </div>
                
                <div className="flex justify-end pt-4">
                  <button
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-200"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase mb-1">Email</h4>
                    <p className="text-gray-800">{profileData.email}</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase mb-1">Location</h4>
                    <p className="text-gray-800">{profileData.location || 'Not specified'}</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase mb-1">Website</h4>
                    {profileData.website ? (
                      <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {profileData.website}
                      </a>
                    ) : (
                      <p className="text-gray-500">Not specified</p>
                    )}
                  </div>
                  
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase mb-1">Member Since</h4>
                    <p className="text-gray-800">January 2023</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Bio</h4>
                  <p className="text-gray-800 whitespace-pre-line">{profileData.bio || 'No bio provided.'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {!isEditing && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Account Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => navigate('/change-password')}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <h4 className="font-medium text-gray-800">Change Password</h4>
                  <p className="text-sm text-gray-500">Update your password</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              <button 
                onClick={() => navigate('/notification-settings')}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <h4 className="font-medium text-gray-800">Notification Settings</h4>
                  <p className="text-sm text-gray-500">Manage your notifications</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;