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

// Helper function to get all images for a profile
const getAllProfileImages = (profile) => {
  const images = [];
  
  // Add profile picture if available
  if (profile.profile_picture_url) {
    images.push(profile.profile_picture_url);
  }
  
  // Add additional photos if available
  if (profile.photos_urls && Array.isArray(profile.photos_urls) && profile.photos_urls.length > 0) {
    images.push(...profile.photos_urls);
  }
  
  // If no images from API, use fallback
  if (images.length === 0) {
    images.push(getProfileImage(profile));
  }
  
  return images;
};

const Search = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [passedProfiles, setPassedProfiles] = useState(new Set());
  const [actionHistory, setActionHistory] = useState([]);
  const [loadingActions, setLoadingActions] = useState({});
  const [heartAnimations, setHeartAnimations] = useState({});
  const [currentImageIndices, setCurrentImageIndices] = useState({});
  const [touchPositions, setTouchPositions] = useState({});
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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    searchProfiles();
  }, [page]);

  // Reset image indices when profiles change
  useEffect(() => {
    setCurrentImageIndices({});
  }, [profiles.map(p => p.id).join(',')]);

  // Keyboard navigation for carousels on Search page
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Only handle if not typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      // Find the first profile with multiple images that's currently visible
      const profileWithMultipleImages = profiles.find(p => {
        const images = getAllProfileImages(p);
        return images.length > 1;
      });
      
      if (!profileWithMultipleImages) return;
      
      const profileId = profileWithMultipleImages.id;
      const images = getAllProfileImages(profileWithMultipleImages);
      const currentIndex = currentImageIndices[profileId] || 0;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentImageIndices(prev => ({
          ...prev,
          [profileId]: currentIndex === 0 ? images.length - 1 : currentIndex - 1
        }));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentImageIndices(prev => ({
          ...prev,
          [profileId]: currentIndex === images.length - 1 ? 0 : currentIndex + 1
        }));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [profiles, currentImageIndices]);

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
      // Filter out passed profiles
      const allProfiles = response.data.profiles || [];
      const filteredProfiles = allProfiles.filter(p => !passedProfiles.has(p.user_id));
      setProfiles(filteredProfiles);
      setTotalPages(response.data.pagination?.total_pages || 1);
      setTotalCount(response.data.pagination?.total_count || 0);
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

  // Track action for undo functionality
  const trackAction = (action, profileId, data = {}) => {
    setActionHistory(prev => [...prev.slice(-9), { action, profileId, data, timestamp: Date.now() }]);
  };

  // Undo last action
  const handleUndo = () => {
    if (actionHistory.length === 0) {
      toast.error('No action to undo');
      return;
    }

    const lastAction = actionHistory[actionHistory.length - 1];
    const { action, profileId, data } = lastAction;

    switch (action) {
      case 'pass':
        setPassedProfiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(profileId);
          return newSet;
        });
        toast.success('Profile restored');
        break;
      case 'like':
      case 'superLike':
        // Note: We can't undo sending an interest, but we can show a message
        toast.info('Interest cannot be undone, but you can view it in your sent interests');
        break;
      default:
        toast.info('Action cannot be undone');
    }

    setActionHistory(prev => prev.slice(0, -1));
  };

  // Pass/Reject a profile
  const handlePass = async (profileId) => {
    setLoadingActions(prev => ({ ...prev, [profileId]: 'pass' }));
    
    try {
      // Add to passed profiles to hide it
      setPassedProfiles(prev => new Set([...prev, profileId]));
      trackAction('pass', profileId);
      
      // Remove from current view
      setProfiles(prev => prev.filter(p => p.user_id !== profileId));
      
      toast.success('Profile passed');
    } catch (error) {
      toast.error('Failed to pass profile');
    } finally {
      setLoadingActions(prev => {
        const newState = { ...prev };
        delete newState[profileId];
        return newState;
      });
    }
  };

  // Send interest (Like)
  const sendInterest = async (userId, profileId) => {
    // Trigger heart animation
    setHeartAnimations(prev => ({ ...prev, [profileId]: true }));
    
    // Remove animation after it completes
    setTimeout(() => {
      setHeartAnimations(prev => {
        const newState = { ...prev };
        delete newState[profileId];
        return newState;
      });
    }, 2000);
    
    setLoadingActions(prev => ({ ...prev, [profileId]: 'like' }));
    
    try {
      const response = await api.post('/interests', { receiver_id: userId });
      trackAction('like', profileId, { userId });
      
      // Remove from current view after sending interest (with delay to see animation)
      setTimeout(() => {
        setProfiles(prev => prev.filter(p => p.user_id !== userId));
      }, 1500);
      
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
        setTimeout(() => {
          setProfiles(prev => prev.filter(p => p.user_id !== userId));
        }, 1500);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoadingActions(prev => {
        const newState = { ...prev };
        delete newState[profileId];
        return newState;
      });
    }
  };

  // Super Like (treat as special interest)
  const handleSuperLike = async (userId, profileId) => {
    setLoadingActions(prev => ({ ...prev, [profileId]: 'superLike' }));
    
    try {
      const response = await api.post('/interests', { receiver_id: userId });
      trackAction('superLike', profileId, { userId });
      
      // Remove from current view after super like
      setProfiles(prev => prev.filter(p => p.user_id !== userId));
      
      // Show appropriate message
      if (response.data.message === 'Interest already sent') {
        toast.success('Super Like already sent! ⭐');
      } else {
        toast.success('Super Like sent! ⭐');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.errors?.[0] || 'Failed to send super like';
      
      // Handle specific error messages more gracefully
      if (errorMessage.includes('already been taken') || errorMessage.includes('already sent')) {
        toast.success('Super Like already sent! ⭐');
        // Still remove from view since interest exists
        setProfiles(prev => prev.filter(p => p.user_id !== userId));
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoadingActions(prev => {
        const newState = { ...prev };
        delete newState[profileId];
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

  const clearFilters = () => {
    setFilters({
      min_age: '', max_age: '', religion: '', caste: '',
      education: '', profession: '', city: '', state: '',
      min_height: '', max_height: '',
    });
    setPage(1);
    // Trigger search after clearing filters
    setTimeout(() => {
      searchProfiles();
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Discover Profiles</h1>
              <p className="text-sm text-gray-500 mt-1">Browse all available profiles and find your perfect match</p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden px-4 py-2 bg-pink-600 text-white text-sm font-medium hover:bg-pink-700 transition-colors"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Filters Sidebar */}
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
                    onClick={clearFilters}
                    className="w-full px-4 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-all duration-200 rounded-lg hover:shadow-sm"
                  >
                    Clear All
                </button>
                </div>
              </form>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-9">
            {loading ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="inline-block animate-spin h-8 w-8 border-3 border-pink-500 border-t-transparent rounded-full"></div>
                <p className="mt-4 text-sm text-gray-600 font-medium">Searching profiles...</p>
              </div>
            ) : profiles.length > 0 ? (
              <>
                {/* Results Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        Found <span className="font-semibold text-gray-900">{profiles.length}</span> profiles
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-medium">Page {page} of {totalPages}</span>
                    </div>
                  </div>
                </div>

                {/* Profile Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {profiles.map((profile) => (
                    <div 
                      key={profile.id} 
                      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 group border border-gray-100"
                    >
                      {/* Profile Image Carousel */}
                      {(() => {
                        const images = getAllProfileImages(profile);
                        const hasMultipleImages = images.length > 1;
                        const currentIndex = currentImageIndices[profile.id] || 0;
                        
                        const goToPrevious = (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCurrentImageIndices(prev => ({
                            ...prev,
                            [profile.id]: currentIndex === 0 ? images.length - 1 : currentIndex - 1
                          }));
                        };
                        
                        const goToNext = (e) => {
                          if (e) {
                            e.preventDefault();
                            e.stopPropagation();
                          }
                          setCurrentImageIndices(prev => ({
                            ...prev,
                            [profile.id]: currentIndex === images.length - 1 ? 0 : currentIndex + 1
                          }));
                        };
                        
                        // Swipe handlers
                        const minSwipeDistance = 50;
                        const handleTouchStart = (e) => {
                          setTouchPositions(prev => ({
                            ...prev,
                            [profile.id]: { start: e.targetTouches[0].clientX, end: null }
                          }));
                        };
                        const handleTouchMove = (e) => {
                          setTouchPositions(prev => ({
                            ...prev,
                            [profile.id]: { ...prev[profile.id], end: e.targetTouches[0].clientX }
                          }));
                        };
                        const handleTouchEnd = () => {
                          const touch = touchPositions[profile.id];
                          if (!touch || !touch.start || !touch.end) return;
                          const distance = touch.start - touch.end;
                          const isLeftSwipe = distance > minSwipeDistance;
                          const isRightSwipe = distance < -minSwipeDistance;
                          if (isLeftSwipe && hasMultipleImages) {
                            goToNext();
                          }
                          if (isRightSwipe && hasMultipleImages) {
                            goToPrevious();
                          }
                          setTouchPositions(prev => ({
                            ...prev,
                            [profile.id]: { start: null, end: null }
                          }));
                        };
                        
                        return (
                          <div 
                            className="relative h-[450px] bg-gradient-to-br from-pink-50 to-purple-50 group/image-carousel select-none" 
                            style={{ position: 'relative' }}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                          >
                            {/* Image Container with overflow hidden */}
                            <div className="relative w-full h-full overflow-hidden rounded-t-2xl">
                              {images.map((imageUrl, index) => (
                                <div
                                  key={index}
                                  className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                                    index === currentIndex 
                                      ? 'opacity-100 z-10 scale-100' 
                                      : index < currentIndex
                                      ? 'opacity-0 z-0 scale-95 -translate-x-4'
                                      : 'opacity-0 z-0 scale-95 translate-x-4'
                                  }`}
                                >
                                  <img 
                                    src={imageUrl} 
                                    alt={`${profile.full_name} - Image ${index + 1}`} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out" 
                                    loading={index === 0 ? 'eager' : index <= currentIndex + 1 ? 'lazy' : 'lazy'}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      const fallback = e.target.nextElementSibling;
                                      if (fallback) {
                                        fallback.style.display = 'flex';
                                      }
                                    }}
                                  />
                                  <div className="w-full h-full hidden items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-pink-100">
                                    <div className="text-8xl text-pink-300">👤</div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Navigation Arrows - Subtle, transparent by default */}
                            {hasMultipleImages && (
                              <>
                                {/* Left Arrow */}
                                <button
                                  type="button"
                                  onClick={goToPrevious}
                                  className="absolute left-3 top-1/2 -translate-y-1/2 z-[9999] w-12 h-12 md:w-14 md:h-14 bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 border border-white/50 hover:border-white/80 hover:bg-white/80 cursor-pointer group/arrow"
                                  aria-label={`Previous image (${currentIndex + 1} of ${images.length})`}
                                >
                                  <svg className="w-6 h-6 md:w-7 md:h-7 text-white/80 group-hover/arrow:text-white transition-colors drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                  </svg>
                                </button>
                                
                                {/* Right Arrow */}
                                <button
                                  type="button"
                                  onClick={goToNext}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 z-[9999] w-12 h-12 md:w-14 md:h-14 bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 border border-white/50 hover:border-white/80 hover:bg-white/80 cursor-pointer group/arrow"
                                  aria-label={`Next image (${currentIndex + 1} of ${images.length})`}
                                >
                                  <svg className="w-6 h-6 md:w-7 md:h-7 text-white/80 group-hover/arrow:text-white transition-colors drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                  </svg>
                                </button>
                              </>
                            )}

                            {/* Image Counter & Indicators - Subtle, transparent by default */}
                            {hasMultipleImages && (
                              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2">
                                {/* Image Counter - Subtle */}
                                <div className="bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-white/20 opacity-70 hover:opacity-100 transition-opacity duration-300">
                                  <span className="text-xs font-semibold text-white/90">
                                    {currentIndex + 1} / {images.length}
                                  </span>
                                </div>
                                
                                {/* Dot Indicators - Subtle */}
                                <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-2 rounded-full shadow-lg border border-white/20 opacity-70 hover:opacity-100 transition-opacity duration-300">
                                  {images.map((_, index) => (
                                    <button
                                      key={index}
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setCurrentImageIndices(prev => ({
                                          ...prev,
                                          [profile.id]: index
                                        }));
                                      }}
                                      className={`transition-all duration-300 rounded-full cursor-pointer ${
                                        index === currentIndex
                                          ? 'w-2.5 h-2.5 bg-white scale-125 ring-1 ring-white/50'
                                          : 'w-2 h-2 bg-white/50 hover:bg-white/70 hover:scale-110'
                                      }`}
                                      aria-label={`Go to image ${index + 1} of ${images.length}`}
                                      aria-current={index === currentIndex ? 'true' : 'false'}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Heart Bubble Animation */}
                            {heartAnimations[profile.id] && (
                              <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                                {[...Array(35)].map((_, i) => {
                                  // Spread hearts across the entire card width (5% to 95%)
                                  const randomX = 5 + Math.random() * 90;
                                  const randomDelay = i * 0.03 + Math.random() * 0.05; // More random stagger
                                  const randomDuration = 2 + Math.random() * 0.8; // Vary duration between 2-2.8s
                                  
                                  // Random size variation - completely mixed sizes (like breaking apart)
                                  // Mix of small, medium, and large hearts randomly
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
                            
                            {/* Status Badges - Top Left */}
                            <div className="absolute top-5 left-5 flex flex-col gap-2 z-20">
                              {profile.is_active && (
                                <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg">
                                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                                  <span className="text-gray-700 text-xs font-semibold">Active Now</span>
                                </div>
                              )}
                              {profile.interest_accepted && (
                                <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2 backdrop-blur-sm">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                  </svg>
                                  <span className="text-xs font-bold">Connected</span>
                                </div>
                              )}
                            </div>

                            {/* View Profile Button - Only show for non-connected profiles */}
                            {!profile.interest_accepted && (
                              <Link
                                to={`/profile/${profile.user_id}`}
                                className="absolute top-5 right-5 w-11 h-11 bg-white/95 backdrop-blur-md hover:bg-white rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 z-20"
                              >
                                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </Link>
                            )}

                            {/* Info Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent pt-20 pb-5 px-5">
                              <div className="flex items-center gap-2.5 mb-3">
                                <h3 className="text-2xl font-bold text-white tracking-tight">{profile.full_name}</h3>
                                <span className="text-white/90 text-base font-medium">{profile.age}</span>
                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              </div>
                              <div className="flex items-center gap-5 text-white/95 text-sm">
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span className="font-medium">{profile.city}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                  <span className="font-medium">{profile.profession}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Action Buttons */}
                      <div className="bg-white px-6 py-6 border-t border-gray-100">
                        {profile.interest_accepted ? (
                          /* Connected Profile - Clean, focused design */
                          <div className="flex items-center justify-between gap-4">
                        <Link
                          to={`/profile/${profile.user_id}`}
                              className="flex-1 px-6 py-3.5 bg-white border-2 border-gray-200 hover:border-pink-300 hover:bg-pink-50 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md text-gray-700 hover:text-pink-600 font-semibold"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <span>View Profile</span>
                        </Link>
                        <button
                              onClick={() => handleMessage(profile.user_id)}
                              disabled={loadingActions[profile.user_id] === 'message'}
                              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {loadingActions[profile.user_id] === 'message' ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <>
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                  </svg>
                                  <span>Message</span>
                                </>
                              )}
                            </button>
                          </div>
                        ) : (
                          /* Non-Connected Profile - Standard action buttons */
                          <div className="flex items-center justify-between">
                            {/* Secondary Actions */}
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={handleUndo}
                                disabled={actionHistory.length === 0}
                                className="w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-all duration-200 border border-gray-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Undo Last Action"
                              >
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                </svg>
                              </button>
                              {/* Chat button - disabled for non-connected */}
                              <button 
                                disabled={true}
                                className="w-12 h-12 bg-gray-100 border border-gray-200 opacity-50 cursor-not-allowed rounded-xl flex items-center justify-center transition-all duration-200"
                                title="Connect first to message"
                              >
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                              </button>
                            </div>

                            {/* Primary Actions */}
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => handlePass(profile.user_id)}
                                disabled={loadingActions[profile.user_id] === 'pass'}
                                className="w-16 h-16 bg-white border-2 border-red-200 hover:border-red-400 hover:bg-red-50 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Pass"
                              >
                                {loadingActions[profile.user_id] === 'pass' ? (
                                  <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                )}
                              </button>
                              <button 
                                onClick={() => handleSuperLike(profile.user_id, profile.id)}
                                disabled={loadingActions[profile.id] === 'superLike'}
                                className="w-16 h-16 bg-white border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Super Like"
                              >
                                {loadingActions[profile.id] === 'superLike' ? (
                                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                  </svg>
                                )}
                              </button>
                              <button 
                                onClick={() => sendInterest(profile.user_id, profile.id)}
                                disabled={loadingActions[profile.id] === 'like'}
                                className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Like"
                              >
                                {loadingActions[profile.id] === 'like' ? (
                                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                  </svg>
                                )}
                        </button>
                            </div>

                            {/* View Profile Link */}
                            <Link
                              to={`/profile/${profile.user_id}`}
                              className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 rounded-xl flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg text-white"
                              title="View Full Profile"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Enhanced Pagination */}
                {totalPages > 1 && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 px-6 py-5">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      {/* Results Info */}
                      <div className="text-sm text-gray-600 font-medium">
                        Showing <span className="font-bold text-gray-900">{profiles.length}</span> of <span className="font-bold text-gray-900">{totalCount || 'many'}</span> profiles
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
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No profiles found</h3>
                <p className="text-sm text-gray-600 mb-4">Try adjusting your filters to find more matches.</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-200 rounded-lg shadow-md hover:shadow-lg"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
