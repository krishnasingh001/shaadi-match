import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  if (profile?.profile_picture_url) {
    return profile.profile_picture_url;
  }
  const imageIndex = (profile?.id || profile?.user_id || 0) % PROFILE_IMAGES.length;
  return PROFILE_IMAGES[imageIndex];
};

const MyProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [sentInterests, setSentInterests] = useState([]);
  const [receivedInterests, setReceivedInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [interestsLoading, setInterestsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Get all images: profile picture + additional photos
  const getAllProfileImages = (profileData) => {
    if (!profileData) return [getProfileImage({})];
    
    const imageList = [];
    
    // Add profile picture if available
    if (profileData.profile_picture_url) {
      imageList.push(profileData.profile_picture_url);
    }
    
    // Add additional photos if available
    if (profileData.photos_urls && Array.isArray(profileData.photos_urls) && profileData.photos_urls.length > 0) {
      imageList.push(...profileData.photos_urls);
    }
    
    // If no images from API, use fallback
    if (imageList.length === 0) {
      imageList.push(getProfileImage(profileData));
    }
    
    return imageList;
  };

  const images = profile ? getAllProfileImages(profile) : [];
  const hasMultipleImages = images.length > 1;

  const goToPreviousImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToNextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      setProfile(response.data);
      // Reset image index when profile loads
      setCurrentImageIndex(0);
    } catch (error) {
      if (error.response?.status === 404) {
        setProfile(null);
      } else {
        toast.error('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchInterests();
  }, []);

  // Refresh profile when location changes (e.g., returning from edit page)
  useEffect(() => {
    if (location.pathname === '/profile') {
      fetchProfile();
    }
  }, [location.pathname]);

  // Keyboard navigation for image carousel
  useEffect(() => {
    if (!hasMultipleImages) return;

    const handleKeyPress = (e) => {
      // Only handle if not typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPreviousImage();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNextImage();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [hasMultipleImages, goToPreviousImage, goToNextImage]);

  const fetchInterests = async () => {
    setInterestsLoading(true);
    try {
      const [sentResponse, receivedResponse] = await Promise.all([
        api.get('/interests?type=sent'),
        api.get('/interests?type=received')
      ]);
      
      setSentInterests(sentResponse.data || []);
      setReceivedInterests(receivedResponse.data || []);
    } catch (error) {
      toast.error('Failed to load interests');
    } finally {
      setInterestsLoading(false);
    }
  };

  const handleAcceptInterest = async (interestId) => {
    try {
      await api.patch(`/interests/${interestId}/accept`);
      toast.success('Interest accepted!');
      fetchInterests();
    } catch (error) {
      toast.error(error.response?.data?.errors?.[0] || 'Failed to accept interest');
    }
  };

  const handleRejectInterest = async (interestId) => {
    try {
      await api.patch(`/interests/${interestId}/reject`);
      toast.success('Interest rejected');
      fetchInterests();
    } catch (error) {
      toast.error(error.response?.data?.errors?.[0] || 'Failed to reject interest');
    }
  };

  const handleCancelInterest = async (interestId) => {
    // Find the interest to restore if needed
    const interestToCancel = sentInterests.find(i => i.id === interestId);
    
    // Optimistic update - remove immediately from UI for instant feedback
    setSentInterests(prev => prev.filter(i => i.id !== interestId));
    
    // Show success toast with undo option
    const toastId = toast.success(
      (t) => (
        <div className="flex items-center gap-3">
          <span className="font-medium">Interest request cancelled</span>
          <button
            onClick={() => {
              // Restore the interest
              if (interestToCancel) {
                setSentInterests(prev => [...prev, interestToCancel].sort((a, b) => a.id - b.id));
              }
              toast.dismiss(t.id);
              toast.success('Interest request restored');
            }}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-all duration-200"
          >
            Undo
          </button>
        </div>
      ),
      {
        duration: 5000,
        id: `cancel-${interestId}`,
      }
    );
    
    try {
      await api.delete(`/interests/${interestId}`);
      // Success - toast already shown, no need to refresh
    } catch (error) {
      // Restore on error
      if (interestToCancel) {
        setSentInterests(prev => [...prev, interestToCancel].sort((a, b) => a.id - b.id));
      }
      toast.dismiss(`cancel-${interestId}`);
      toast.error(error.response?.data?.errors?.[0] || 'Failed to cancel interest', {
        duration: 4000,
      });
    }
  };

  const formatEnum = (value) => {
    if (!value) return 'N/A';
    return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin h-12 w-12 border-3 border-pink-500 border-t-transparent rounded-full"></div>
          <p className="mt-4 text-sm text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">No Profile Found</h2>
            <p className="text-gray-600 mb-8">Create your profile to get started with finding your perfect match!</p>
            <Link 
              to="/profile/create" 
              className="inline-block px-8 py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Create Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <Link 
              to="/profile/edit" 
              className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              My Profile
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors relative ${
                activeTab === 'sent'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Sent Interests
              {sentInterests.length > 0 && (
                <span className="absolute top-2 right-4 bg-white text-pink-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {sentInterests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('received')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors relative ${
                activeTab === 'received'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Received Interests
              {receivedInterests.length > 0 && (
                <span className="absolute top-2 right-4 bg-white text-pink-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {receivedInterests.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Sidebar - Profile Image Carousel */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-24">
                <div 
                  className="relative h-[500px] bg-gradient-to-br from-pink-50 to-purple-50 select-none group"
                  onTouchStart={(e) => {
                    setTouchStart(e.targetTouches[0].clientX);
                    setTouchEnd(null);
                  }}
                  onTouchMove={(e) => {
                    setTouchEnd(e.targetTouches[0].clientX);
                  }}
                  onTouchEnd={() => {
                    if (!touchStart || !touchEnd) {
                      setTouchStart(null);
                      setTouchEnd(null);
                      return;
                    }
                    const distance = touchStart - touchEnd;
                    const minSwipeDistance = 50;
                    const isLeftSwipe = distance > minSwipeDistance;
                    const isRightSwipe = distance < -minSwipeDistance;
                    if (isLeftSwipe && hasMultipleImages) {
                      goToNextImage();
                    }
                    if (isRightSwipe && hasMultipleImages) {
                      goToPreviousImage();
                    }
                    setTouchStart(null);
                    setTouchEnd(null);
                  }}
                >
                  {/* Image Container */}
                  <div className="relative w-full h-full overflow-hidden">
                    {images.map((imageUrl, index) => (
                      <div
                        key={index}
                        className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                          index === currentImageIndex 
                            ? 'opacity-100 z-10 scale-100' 
                            : index < currentImageIndex
                            ? 'opacity-0 z-0 scale-95 -translate-x-4'
                            : 'opacity-0 z-0 scale-95 translate-x-4'
                        }`}
                      >
                        <img 
                          src={imageUrl} 
                          alt={`${profile.full_name || profile.first_name} - Image ${index + 1}`} 
                          className="w-full h-full object-cover" 
                          loading={index === 0 ? 'eager' : index <= currentImageIndex + 1 ? 'lazy' : 'lazy'}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const fallback = e.target.nextElementSibling;
                            if (fallback) {
                              fallback.style.display = 'flex';
                            }
                          }}
                        />
                        <div className="w-full h-full hidden items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-pink-100">
                          <div className="text-9xl text-pink-300">👤</div>
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
                        onClick={goToPreviousImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-[9999] w-14 h-14 bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 border border-white/50 hover:border-white/80 hover:bg-white/80 cursor-pointer group/arrow"
                        aria-label={`Previous image (${currentImageIndex + 1} of ${images.length})`}
                      >
                        <svg className="w-7 h-7 text-white/80 group-hover/arrow:text-white transition-colors drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>

                      {/* Right Arrow */}
                      <button
                        type="button"
                        onClick={goToNextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-[9999] w-14 h-14 bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 border border-white/50 hover:border-white/80 hover:bg-white/80 cursor-pointer group/arrow"
                        aria-label={`Next image (${currentImageIndex + 1} of ${images.length})`}
                      >
                        <svg className="w-7 h-7 text-white/80 group-hover/arrow:text-white transition-colors drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}

                  {/* Image Counter & Indicators - Subtle, transparent by default */}
                  {hasMultipleImages && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2">
                      {/* Image Counter - Subtle */}
                      <div className="bg-black/30 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/20 opacity-70 hover:opacity-100 transition-opacity duration-300">
                        <span className="text-sm font-semibold text-white/90">
                          {currentImageIndex + 1} / {images.length}
                        </span>
                      </div>
                      
                      {/* Dot Indicators - Subtle */}
                      <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-2 rounded-full shadow-lg border border-white/20 opacity-70 hover:opacity-100 transition-opacity duration-300">
                        {images.map((_, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setCurrentImageIndex(index)}
                            className={`transition-all duration-300 rounded-full cursor-pointer ${
                              index === currentImageIndex
                                ? 'w-2.5 h-2.5 bg-white scale-125 ring-1 ring-white/50'
                                : 'w-2 h-2 bg-white/50 hover:bg-white/70 hover:scale-110'
                            }`}
                            aria-label={`Go to image ${index + 1} of ${images.length}`}
                            aria-current={index === currentImageIndex ? 'true' : 'false'}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-6 text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim()}
                  </h2>
                  <p className="text-gray-600 font-medium">{profile.age} years old</p>
                </div>
              </div>
            </div>

            {/* Right Side - Profile Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900">{profile.height || 'N/A'}</div>
                    <div className="text-xs text-gray-600 font-medium mt-1">Height (cm)</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900">{formatEnum(profile.marital_status)}</div>
                    <div className="text-xs text-gray-600 font-medium mt-1">Status</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900">{formatEnum(profile.diet)}</div>
                    <div className="text-xs text-gray-600 font-medium mt-1">Diet</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900">{profile.religion || 'N/A'}</div>
                    <div className="text-xs text-gray-600 font-medium mt-1">Religion</div>
                  </div>
                </div>
              </div>

              {/* About Me */}
              {profile.about_me && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-1 h-8 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full"></div>
                    About Me
                  </h2>
                  <p className="text-gray-700 leading-relaxed">{profile.about_me}</p>
                </div>
              )}

              {/* Education & Career */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                  Education & Career
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 font-medium mb-1">Education</div>
                      <div className="text-lg font-semibold text-gray-900">{profile.education || 'Not specified'}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 font-medium mb-1">Profession</div>
                      <div className="text-lg font-semibold text-gray-900">{profile.profession || 'Not specified'}</div>
                    </div>
                  </div>
                  {profile.annual_income && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 font-medium mb-1">Annual Income</div>
                        <div className="text-lg font-semibold text-gray-900">₹{profile.annual_income.toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Family & Background */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                  Family & Background
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 font-medium mb-1">Religion</div>
                      <div className="text-lg font-semibold text-gray-900">{profile.religion || 'Not specified'}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 font-medium mb-1">Caste</div>
                      <div className="text-lg font-semibold text-gray-900">{profile.caste || 'Not specified'}</div>
                    </div>
                  </div>
                  {profile.sub_caste && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 font-medium mb-1">Sub Caste</div>
                        <div className="text-lg font-semibold text-gray-900">{profile.sub_caste}</div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 font-medium mb-1">Lifestyle</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {formatEnum(profile.diet)} • {formatEnum(profile.drinking)} • {formatEnum(profile.smoking)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
                  Location
                </h2>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 font-medium mb-1">Current Location</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {profile.city}, {profile.state}, {profile.country}
                    </div>
                    {profile.native_place && (
                      <div className="text-sm text-gray-600 mt-1">Native: {profile.native_place}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Family Details */}
              {profile.family_details && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-1 h-8 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
                    Family Details
                  </h2>
                  <div className="space-y-4">
                    {profile.father_name && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Father's Name</div>
                          <div className="font-semibold text-gray-900">{profile.father_name}</div>
                        </div>
                      </div>
                    )}
                    {profile.mother_name && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Mother's Name</div>
                          <div className="font-semibold text-gray-900">{profile.mother_name}</div>
                        </div>
                      </div>
                    )}
                    {profile.siblings && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Siblings</div>
                          <div className="font-semibold text-gray-900">{profile.siblings}</div>
                        </div>
                      </div>
                    )}
                    <p className="text-gray-700 leading-relaxed mt-4 pt-4 border-t border-gray-100">{profile.family_details}</p>
                  </div>
                </div>
              )}

              {/* Languages */}
              {profile.languages_spoken && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-1 h-8 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
                    Languages
                  </h2>
                  <p className="text-lg font-semibold text-gray-900">{profile.languages_spoken}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sent Interests Tab */}
        {activeTab === 'sent' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              Sent Interests ({sentInterests.length})
            </h2>
            {interestsLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin h-8 w-8 border-3 border-pink-500 border-t-transparent rounded-full"></div>
                <p className="mt-4 text-sm text-gray-600">Loading interests...</p>
              </div>
            ) : sentInterests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sentInterests.map((interest) => {
                  const profileData = interest.profile_data || interest.receiver?.profile || {};
                  const status = interest.status || 'pending';
                  
                  return (
                    <div key={interest.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group">
                      <div className="relative h-[380px] bg-gradient-to-br from-pink-50 to-purple-50 overflow-hidden">
                        <img 
                          src={getProfileImage(profileData)} 
                          alt={profileData.full_name || profileData.first_name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out" 
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="w-full h-full hidden items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-pink-100">
                          <div className="text-8xl text-pink-300">👤</div>
                        </div>

                        {/* Status Badge - Enhanced */}
                        <div className="absolute top-4 left-4 z-10">
                          <div className={`px-4 py-2 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm ${
                            status === 'accepted' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                            status === 'rejected' ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white' :
                            'bg-gradient-to-r from-yellow-400 to-amber-500 text-white'
                          }`}>
                            <div className="flex items-center gap-1.5">
                              {status === 'accepted' && (
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                              {status === 'rejected' && (
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              )}
                              {status === 'pending' && (
                                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              )}
                              <span>{status === 'accepted' ? 'Accepted' : status === 'rejected' ? 'Rejected' : 'Pending'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Heart Icon - Enhanced */}
                        <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-pink-500/95 to-rose-500/95 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl border-2 border-white/50">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                        </div>

                        {/* Info Overlay - Enhanced */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent pt-20 pb-5 px-5">
                          <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
                            {profileData.full_name || `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim()}
                          </h3>
                          <div className="flex items-center gap-4 text-white/95 text-sm font-medium">
                            <div className="flex items-center gap-1.5">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span>{profileData.age} years</span>
                            </div>
                            {profileData.city && (
                              <>
                                <span>•</span>
                                <div className="flex items-center gap-1.5">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span>{profileData.city}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons - Enhanced */}
                      <div className="p-5 bg-white border-t border-gray-100">
                        {status === 'pending' ? (
                          <div className="space-y-3">
                            <div className="flex gap-3">
                              <Link
                                to={`/profile/${interest.receiver_id || interest.receiver?.id}`}
                                className="flex-1 px-5 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-200 text-center shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span>View Profile</span>
                              </Link>
                              <button
                                onClick={() => handleCancelInterest(interest.id)}
                                className="px-5 py-3 bg-white border-2 border-red-200 hover:border-red-400 hover:bg-red-50 text-red-600 hover:text-red-700 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md min-w-[120px]"
                                title="Cancel Request"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span>Cancel</span>
                              </button>
                            </div>
                            <div className="text-xs text-gray-500 text-center font-medium">
                              Waiting for response...
                            </div>
                          </div>
                        ) : status === 'accepted' ? (
                          <div className="space-y-3">
                            <Link
                              to={`/profile/${interest.receiver_id || interest.receiver?.id}`}
                              className="block w-full px-5 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-200 text-center shadow-md hover:shadow-lg"
                            >
                              View Profile
                            </Link>
                            <button
                              onClick={() => navigate(`/messages?conversation=${interest.id}`)}
                              className="w-full px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              <span>Start Chat</span>
                            </button>
                          </div>
                        ) : (
                          <Link
                            to={`/profile/${interest.receiver_id || interest.receiver?.id}`}
                            className="block w-full px-5 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-200 text-center shadow-md hover:shadow-lg"
                          >
                            View Profile
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sent Interests</h3>
                <p className="text-sm text-gray-600">You haven't sent any interest requests yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Received Interests Tab */}
        {activeTab === 'received' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              Received Interests ({receivedInterests.length})
            </h2>
            {interestsLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin h-8 w-8 border-3 border-pink-500 border-t-transparent rounded-full"></div>
                <p className="mt-4 text-sm text-gray-600">Loading interests...</p>
              </div>
            ) : receivedInterests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {receivedInterests.map((interest) => {
                  const profileData = interest.profile_data || interest.sender?.profile || {};
                  const status = interest.status || 'pending';
                  
                  return (
                    <div key={interest.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                      <div className="relative h-[350px] bg-gradient-to-br from-pink-50 to-purple-50 overflow-hidden">
                        <img 
                          src={getProfileImage(profileData)} 
                          alt={profileData.full_name || profileData.first_name} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="w-full h-full hidden items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-pink-100">
                          <div className="text-8xl text-pink-300">👤</div>
                        </div>

                        {/* Heart Icon */}
                        <div className="absolute top-4 left-4 w-10 h-10 bg-pink-500/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                        </div>

                        {/* Status Badge */}
                        {status !== 'pending' && (
                          <div className="absolute top-4 right-4">
                            <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                              status === 'accepted' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                            }`}>
                              {status === 'accepted' ? 'Accepted' : 'Rejected'}
                            </div>
                          </div>
                        )}

                        {/* Info Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent pt-16 pb-4 px-4">
                          <h3 className="text-xl font-bold text-white mb-1">
                            {profileData.full_name || `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim()}
                          </h3>
                          <div className="flex items-center gap-3 text-white/90 text-sm">
                            <span>{profileData.age} years</span>
                            <span>•</span>
                            <span>{profileData.city}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 space-y-2">
                        {status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAcceptInterest(interest.id)}
                              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleRejectInterest(interest.id)}
                              className="flex-1 px-4 py-2.5 bg-white border-2 border-red-300 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-50 transition-all duration-200"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        <Link
                          to={`/profile/${interest.sender_id || interest.sender?.id}`}
                          className="block w-full px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-200 text-center shadow-md hover:shadow-lg"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Received Interests</h3>
                <p className="text-sm text-gray-600">No one has sent you an interest request yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProfile;
