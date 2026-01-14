import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

// Available profile images
const PROFILE_IMAGES = [
  '/images/image1.jpg',
  '/images/image2.jpg',
  '/images/image3.jpg',
  '/images/image4.avif',
  '/images/image5.avif',
  '/images/image6.avif',
  '/images/image7.avif',
  '/images/image8.avif',
  '/images/image9.avif',
  '/images/image10.avif',
  '/images/image11.avif',
  '/images/image12.avif',
  '/images/image13.avif',
  '/images/image14.avif',
];

// Helper function to get image for profile
const getProfileImage = (profile) => {
  if (profile.profile_picture_url) {
    return profile.profile_picture_url;
  }
  // Use profile ID to consistently assign an image
  const imageIndex = (profile.id || profile.user_id || 0) % PROFILE_IMAGES.length;
  return PROFILE_IMAGES[imageIndex];
};

const Matches = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingActions, setLoadingActions] = useState({});
  const [heartAnimations, setHeartAnimations] = useState({});
  const [filters, setFilters] = useState({
    min_age: '',
    max_age: '',
    religion: '',
    caste: '',
    education: '',
    profession: '',
    city: '',
    state: '',
    min_height: '',
    max_height: '',
  });
  const [searchMode, setSearchMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!searchMode) {
      fetchMatches();
    }
  }, [searchMode]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const response = await api.get('/matches');
      setMatches(response.data.matches || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast.error('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const searchProfiles = async () => {
    setLoading(true);
    try {
      // Build params object, only including non-empty filter values
      const params = { page };
      
      // Add filters only if they have values
      if (filters.min_age && filters.min_age.trim()) params.min_age = filters.min_age.trim();
      if (filters.max_age && filters.max_age.trim()) params.max_age = filters.max_age.trim();
      if (filters.religion && filters.religion.trim()) params.religion = filters.religion.trim();
      if (filters.caste && filters.caste.trim()) params.caste = filters.caste.trim();
      if (filters.education && filters.education.trim()) params.education = filters.education.trim();
      if (filters.profession && filters.profession.trim()) params.profession = filters.profession.trim();
      if (filters.city && filters.city.trim()) params.city = filters.city.trim();
      if (filters.state && filters.state.trim()) params.state = filters.state.trim();
      if (filters.min_height && filters.min_height.trim()) params.min_height = filters.min_height.trim();
      if (filters.max_height && filters.max_height.trim()) params.max_height = filters.max_height.trim();
      
      const response = await api.get('/search', { params });
      setMatches(response.data.profiles || []);
      setTotalPages(response.data.pagination?.total_pages || 1);
      setSearchMode(true);
    } catch (error) {
      toast.error('Failed to search profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    searchProfiles();
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters({
      min_age: '', max_age: '', religion: '', caste: '',
      education: '', profession: '', city: '', state: '',
      min_height: '', max_height: '',
    });
    setPage(1);
    
    if (searchMode) {
      // If in search mode, clear and search again
      setTimeout(() => {
        searchProfiles();
      }, 0);
    } else {
      // If not in search mode, fetch matches
    setSearchMode(false);
    fetchMatches();
    }
  };

  // Send interest (Like)
  const handleLike = async (userId, profileId) => {
    setLoadingActions(prev => ({ ...prev, [userId]: 'like' }));
    
    // Trigger heart animation
    setHeartAnimations(prev => ({ ...prev, [profileId]: true }));
    setTimeout(() => {
      setHeartAnimations(prev => {
        const newState = { ...prev };
        delete newState[profileId];
        return newState;
      });
    }, 3000);
    
    try {
      const response = await api.post('/interests', { receiver_id: userId });
      
      // Remove from current view after sending interest
      setMatches(prev => prev.filter(p => (p.user_id || p.id) !== userId));
      
      // Show appropriate message based on response
      if (response.data.message === 'Interest already sent') {
        toast.success('Interest already sent!');
      } else {
      toast.success('Interest sent successfully!');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.errors?.[0] || 'Failed to send interest';
      
      // Handle specific error messages more gracefully
      if (errorMessage.includes('already been taken') || errorMessage.includes('already sent')) {
        toast.success('Interest already sent!');
        // Still remove from view since interest exists
        setMatches(prev => prev.filter(p => (p.user_id || p.id) !== userId));
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoadingActions(prev => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
    }
  };

  // Send super like
  const handleSuperLike = async (userId, profileId) => {
    setLoadingActions(prev => ({ ...prev, [userId]: 'superLike' }));
    
    // Trigger heart animation
    setHeartAnimations(prev => ({ ...prev, [profileId]: true }));
    setTimeout(() => {
      setHeartAnimations(prev => {
        const newState = { ...prev };
        delete newState[profileId];
        return newState;
      });
    }, 3000);
    
    try {
      const response = await api.post('/interests', { receiver_id: userId, super_like: true });
      
      // Remove from current view after sending super like
      setMatches(prev => prev.filter(p => (p.user_id || p.id) !== userId));
      
      // Show appropriate message based on response
      if (response.data.message === 'Interest already sent') {
        toast.success('Super Like already sent! 💫');
      } else {
        toast.success('Super like sent! 💫');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.errors?.[0] || 'Failed to send super like';
      
      // Handle specific error messages more gracefully
      if (errorMessage.includes('already been taken') || errorMessage.includes('already sent')) {
        toast.success('Super Like already sent! 💫');
        // Still remove from view since interest exists
        setMatches(prev => prev.filter(p => (p.user_id || p.id) !== userId));
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoadingActions(prev => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
    }
  };

  // Start a conversation
  const handleMessage = async (userId) => {
    setLoadingActions(prev => ({ ...prev, [userId]: 'message' }));
    
    try {
      // Create or get conversation
      const response = await api.post('/conversations', { receiver_id: userId });
      const conversation = response.data;
      
      // Navigate to messages page with conversation ID
      navigate(`/messages?conversation=${conversation.id}`);
      toast.success('Opening conversation...');
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.errors?.[0] || 'Failed to start conversation';
      if (errorMessage.includes('Interest request must be accepted')) {
        toast.error('Interest request must be accepted before you can start a conversation');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoadingActions(prev => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
    }
  };

  // Pass/Reject a profile
  const handlePass = async (profileId, userId) => {
    setLoadingActions(prev => ({ ...prev, [userId]: 'pass' }));
    
    try {
      // Remove from current view
      setMatches(prev => prev.filter(p => (p.user_id || p.id) !== userId));
      toast.success('Profile passed');
    } catch (error) {
      toast.error('Failed to pass profile');
    } finally {
      setLoadingActions(prev => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {searchMode ? 'Discover Profiles' : 'Recommended Matches'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {searchMode ? 'Browse all available profiles and find your perfect match' : 'Personalized matches based on your profile and preferences'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSearchMode(!searchMode);
                  if (searchMode) {
                    fetchMatches();
                  }
                }}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-200 rounded-lg shadow-md hover:shadow-lg"
              >
                {searchMode ? 'Show Recommended' : 'Discover Profiles'}
              </button>
              {searchMode && (
          <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors rounded-lg"
          >
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
              )}
            </div>
          </div>
        </div>
        </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Filters Sidebar - Only show in search mode */}
          {searchMode && (
            <div className={`lg:col-span-3 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 sticky top-4 overflow-hidden">
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 border-b border-gray-100 px-6 py-5">
                  <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                  <p className="text-xs text-gray-600 mt-1 font-medium">Refine your search</p>
                </div>
                
                <form onSubmit={handleSearch} className="p-6 space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Age Range</label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        name="min_age"
                        value={filters.min_age}
                        onChange={handleFilterChange}
                        placeholder="Min"
                        className="w-full px-4 py-2.5 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white rounded-lg transition-all duration-200"
                      />
                      <input
                        type="number"
                        name="max_age"
                        value={filters.max_age}
                        onChange={handleFilterChange}
                        placeholder="Max"
                        className="w-full px-4 py-2.5 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white rounded-lg transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Religion</label>
                    <input
                      type="text"
                      name="religion"
                      value={filters.religion}
                      onChange={handleFilterChange}
                      placeholder="Enter religion"
                      className="w-full px-4 py-2.5 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white rounded-lg transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Caste</label>
                    <input
                      type="text"
                      name="caste"
                      value={filters.caste}
                      onChange={handleFilterChange}
                      placeholder="Enter caste"
                      className="w-full px-4 py-2.5 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white rounded-lg transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Education</label>
                    <input
                      type="text"
                      name="education"
                      value={filters.education}
                      onChange={handleFilterChange}
                      placeholder="Enter education"
                      className="w-full px-4 py-2.5 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white rounded-lg transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Profession</label>
                    <input
                      type="text"
                      name="profession"
                      value={filters.profession}
                      onChange={handleFilterChange}
                      placeholder="Enter profession"
                      className="w-full px-4 py-2.5 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white rounded-lg transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">City</label>
                    <input
                      type="text"
                      name="city"
                      value={filters.city}
                      onChange={handleFilterChange}
                      placeholder="Enter city"
                      className="w-full px-4 py-2.5 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white rounded-lg transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">State</label>
                    <input
                      type="text"
                      name="state"
                      value={filters.state}
                      onChange={handleFilterChange}
                      placeholder="Enter state"
                      className="w-full px-4 py-2.5 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white rounded-lg transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Height (cm)</label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        name="min_height"
                        value={filters.min_height}
                        onChange={handleFilterChange}
                        placeholder="Min"
                        className="w-full px-4 py-2.5 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white rounded-lg transition-all duration-200"
                      />
                      <input
                        type="number"
                        name="max_height"
                        value={filters.max_height}
                        onChange={handleFilterChange}
                        placeholder="Max"
                        className="w-full px-4 py-2.5 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white rounded-lg transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="pt-2 space-y-3">
                    <button 
                      type="submit" 
                      className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-200 rounded-lg shadow-md hover:shadow-lg"
                    >
                      Apply Filters
                  </button>
                  <button
                    type="button"
                    onClick={handleClearFilters}
                      className="w-full px-4 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-all duration-200 rounded-lg hover:shadow-sm"
                  >
                      Clear All
                  </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Results Section */}
          <div className={searchMode ? "lg:col-span-9" : "lg:col-span-12"}>
            {loading ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="inline-block animate-spin h-8 w-8 border-3 border-pink-500 border-t-transparent rounded-full"></div>
                <p className="mt-4 text-sm text-gray-600 font-medium">Loading matches...</p>
              </div>
            ) : matches.length > 0 ? (
              <>
                {/* Results Header */}
                {searchMode && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          Found <span className="font-semibold text-gray-900">{matches.length}</span> profiles
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 font-medium">Page {page} of {totalPages}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Profile Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {matches.map((match) => {
                    const profileId = match.id || match.user_id;
                    const userId = match.user_id || match.id;
                    const isLoading = loadingActions[userId];
                    
                    return (
                      <div 
                        key={profileId} 
                        className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 group border border-gray-100"
                      >
                        {/* Profile Image */}
                        <div className="relative h-[450px] bg-gradient-to-br from-pink-50 to-purple-50 overflow-hidden">
                          <img 
                            src={getProfileImage(match)} 
                            alt={match.name || match.full_name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out" 
                            onError={(e) => {
                              // Fallback to placeholder if image fails to load
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="w-full h-full hidden items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-pink-100">
                            <div className="text-8xl text-pink-300">👤</div>
                          </div>

                          {/* Heart Bubble Animation */}
                          {heartAnimations[profileId] && (
                            <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                              {[...Array(35)].map((_, i) => {
                                // Spread hearts across the entire card width (5% to 95%)
                                const randomX = 5 + Math.random() * 90;
                                const randomDelay = i * 0.03 + Math.random() * 0.05;
                                const randomDuration = 2 + Math.random() * 0.8;
                                
                                // Random size variation - completely mixed sizes
                                const sizeOptions = [0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6];
                                const sizeVariation = sizeOptions[Math.floor(Math.random() * sizeOptions.length)];
                                
                                return (
                                  <div
                                    key={i}
                                    className="absolute bottom-24 animate-heart-rise-shrink"
                                    style={{
                                      left: `${randomX}%`,
                                      animationDelay: `${randomDelay}s`,
                                      animationDuration: `${randomDuration}s`,
                                      '--start-scale': sizeVariation,
                                    }}
                                  >
                                    <svg
                                      className="text-pink-500"
                                      fill="currentColor"
                                      viewBox="0 0 24 24"
                                      style={{
                                        width: `${sizeVariation * 14}px`,
                                        height: `${sizeVariation * 14}px`,
                                        filter: 'drop-shadow(0 4px 8px rgba(236, 72, 153, 0.5))',
                                      }}
                                    >
                                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                    </svg>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          
                          {/* Status Badge */}
                          <div className="absolute top-4 left-4 flex items-center gap-2">
                            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-700 rounded-full shadow-sm">
                              {match.age} years
                            </span>
                            {match.is_active && (
                              <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-gray-700 text-xs font-semibold">Active</span>
                              </div>
                            )}
                          </div>

                          {/* View Profile Overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Link
                              to={`/profile/${userId}`}
                              className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg shadow-lg hover:bg-gray-50 transition-all transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 duration-300"
                            >
                              View Full Profile
                            </Link>
                          </div>
                        </div>

                        {/* Profile Info */}
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {match.name || match.full_name}
                    </h3>
                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  {match.city}, {match.state}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Quick Info */}
                          <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{match.age} years</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              <span>{match.height} cm</span>
                            </div>
                            {match.education && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                <span className="truncate">{match.education}</span>
                              </div>
                            )}
                            {match.profession && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="truncate">{match.profession}</span>
                              </div>
                            )}
                    </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handlePass(profileId, userId)}
                              disabled={isLoading}
                              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-all duration-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isLoading === 'pass' ? '...' : 'Pass'}
                            </button>
                            <button
                              onClick={() => handleSuperLike(userId, profileId)}
                              disabled={isLoading}
                              className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Super Like"
                            >
                              {isLoading === 'superLike' ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                '⭐'
                              )}
                            </button>
                            <button
                              onClick={() => handleLike(userId, profileId)}
                              disabled={isLoading}
                              className="px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-200 rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Like"
                            >
                              {isLoading === 'like' ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                '❤️'
                              )}
                            </button>
                            {match.interest_accepted && (
                              <button
                                onClick={() => handleMessage(userId)}
                                disabled={isLoading}
                                className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-all duration-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Message"
                              >
                                {isLoading === 'message' ? (
                                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  '💬'
                                )}
                              </button>
                            )}
                      <Link
                              to={`/profile/${userId}`}
                              className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-all duration-200 rounded-lg"
                              title="View Profile"
                      >
                              👁️
                      </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Enhanced Pagination - Only show in search mode */}
                {searchMode && totalPages > 1 && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 px-6 py-5 mt-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      {/* Results Info */}
                      <div className="text-sm text-gray-600 font-medium">
                        Showing <span className="font-bold text-gray-900">{matches.length}</span> profiles
                      </div>

                      {/* Pagination Controls */}
                      <div className="flex items-center gap-2">
                        {/* First Page */}
                        <button
                          onClick={() => setPage(1)}
                          disabled={page === 1}
                          className="px-3 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 hover:border-pink-300 hover:text-pink-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 rounded-lg hover:shadow-sm flex items-center gap-1"
                          title="First page"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                          </svg>
                        </button>

                        {/* Previous Button */}
                        <button
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 hover:border-pink-300 hover:text-pink-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 rounded-lg hover:shadow-sm flex items-center gap-1.5"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          <span className="hidden sm:inline">Previous</span>
                        </button>

                        {/* Page Numbers - Smart Display */}
                        <div className="flex items-center gap-1">
                          {(() => {
                            const pages = [];
                            const showAll = totalPages <= 7;
                            
                            if (showAll) {
                              // Show all pages if 7 or fewer
                              for (let i = 1; i <= totalPages; i++) {
                                pages.push(i);
                              }
                            } else {
                              // Smart pagination logic
                              pages.push(1); // Always show first
                              
                              if (page <= 4) {
                                // Near the beginning: show 1, 2, 3, 4, 5, ..., last
                                for (let i = 2; i <= 5; i++) {
                                  pages.push(i);
                                }
                                pages.push('ellipsis-end');
                                pages.push(totalPages);
                              } else if (page >= totalPages - 3) {
                                // Near the end: show 1, ..., last-4, last-3, last-2, last-1, last
                                pages.push('ellipsis-start');
                                for (let i = totalPages - 4; i <= totalPages; i++) {
                                  pages.push(i);
                                }
                              } else {
                                // In the middle: show 1, ..., current-1, current, current+1, ..., last
                                pages.push('ellipsis-start');
                                pages.push(page - 1);
                                pages.push(page);
                                pages.push(page + 1);
                                pages.push('ellipsis-end');
                                pages.push(totalPages);
                              }
                            }
                            
                            return pages.map((pageNum, idx) => {
                              if (pageNum === 'ellipsis-start' || pageNum === 'ellipsis-end') {
                                return (
                                  <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 font-semibold">
                                    ...
                                  </span>
                                );
                              }
                              
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setPage(pageNum)}
                                  className={`w-10 h-10 text-sm font-semibold transition-all duration-200 rounded-lg ${
                                    page === pageNum
                                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg scale-105'
                                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-pink-50 hover:border-pink-300 hover:text-pink-600 hover:shadow-md'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            });
                          })()}
                        </div>

                        {/* Next Button */}
                        <button
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                          className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 hover:border-pink-300 hover:text-pink-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 rounded-lg hover:shadow-sm flex items-center gap-1.5"
                        >
                          <span className="hidden sm:inline">Next</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>

                        {/* Last Page */}
                      <button
                          onClick={() => setPage(totalPages)}
                          disabled={page === totalPages}
                          className="px-3 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 hover:border-pink-300 hover:text-pink-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 rounded-lg hover:shadow-sm flex items-center gap-1"
                          title="Last page"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                          </svg>
                      </button>
                      </div>

                      {/* Page Input - Quick Jump */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 font-medium hidden md:inline">Go to:</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            max={totalPages}
                            value={page}
                            onChange={(e) => {
                              const newPage = parseInt(e.target.value);
                              if (newPage >= 1 && newPage <= totalPages) {
                                setPage(newPage);
                              }
                            }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const newPage = parseInt(e.target.value);
                                if (newPage >= 1 && newPage <= totalPages) {
                                  setPage(newPage);
                                }
                              }
                            }}
                            className="w-16 px-3 py-2 text-sm font-semibold text-center border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                          />
                          <span className="text-sm text-gray-500 font-medium">/ {totalPages}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="text-6xl mb-4">💔</div>
                <p className="text-gray-600 text-lg mb-2 font-medium">
                  {searchMode 
                    ? 'No profiles found' 
                    : 'No matches found'}
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  {searchMode 
                    ? 'Try adjusting your filters to find more profiles.' 
                    : 'Complete your profile and partner preferences to get better matches!'}
                </p>
                {!searchMode && (
                  <Link 
                    to="/profile/edit" 
                    className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-200 rounded-lg shadow-md hover:shadow-lg"
                  >
                    Update Profile
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Matches;
