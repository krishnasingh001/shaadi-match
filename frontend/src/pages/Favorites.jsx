import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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

const Favorites = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndices, setCurrentImageIndices] = useState({});
  const [touchPositions, setTouchPositions] = useState({});

  // Get all images: profile picture + additional photos - memoized for performance
  const getAllProfileImages = useCallback((profileData) => {
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
  }, []);

  // Memoize favorites processing for performance
  const processedFavorites = useMemo(() => {
    if (!favorites || favorites.length === 0) return [];
    
    return favorites.map(favorite => {
      const user = favorite.favorite_user || favorite.user || {};
      const profile = user?.profile || favorite.profile || {};
      const userId = user?.id || favorite.favorite_user_id || favorite.user_id;
      
      // Get display name - handle multiple possible formats with fallbacks
      // Check in order: full_name method, first_name+last_name, first_name only, user.name, email
      let displayName = null;
      
      // Try profile.full_name (from backend method)
      if (profile?.full_name && typeof profile.full_name === 'string' && profile.full_name.trim()) {
        displayName = profile.full_name.trim();
      }
      // Try first_name + last_name combination
      else if (profile?.first_name && typeof profile.first_name === 'string') {
        const firstName = profile.first_name.trim();
        const lastName = profile?.last_name && typeof profile.last_name === 'string' ? profile.last_name.trim() : '';
        displayName = lastName ? `${firstName} ${lastName}`.trim() : firstName;
      }
      // Try user.name
      else if (user?.name && typeof user.name === 'string' && user.name.trim()) {
        displayName = user.name.trim();
      }
      // Fallback to email username
      else if (user?.email && typeof user.email === 'string') {
        displayName = user.email.split('@')[0];
      }
      
      // Final fallback
      if (!displayName || displayName.length === 0) {
        displayName = 'Unknown User';
      }
      
      const images = getAllProfileImages(profile);
      
      return {
        ...favorite,
        user,
        profile,
        userId,
        displayName, // Always has a value
        images,
        hasMultipleImages: images.length > 1
      };
    });
  }, [favorites, getAllProfileImages]);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/favorites');
      const favoritesData = response.data || [];
      setFavorites(favoritesData);
      // Reset image indices when favorites change
      setCurrentImageIndices({});
    } catch (error) {
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // Refresh favorites when location changes (e.g., returning from adding a favorite)
  useEffect(() => {
    if (location.pathname === '/favorites') {
      fetchFavorites();
    }
  }, [location.pathname, fetchFavorites]);

  // Listen for focus events to refresh when user returns to the tab/page
  useEffect(() => {
    const handleFocus = () => {
      if (location.pathname === '/favorites') {
        fetchFavorites();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [location.pathname, fetchFavorites]);

  const removeFavorite = async (userId, favoriteId) => {
    // Optimistic update
    const favoriteToRemove = favorites.find(f => f.favorite_user_id === userId || f.id === favoriteId);
    setFavorites(prev => prev.filter(f => f.favorite_user_id !== userId && f.id !== favoriteId));
    
    toast.loading('Removing from favorites...', { id: `remove-${userId}` });
    
    try {
      await api.delete(`/favorites/${userId}`);
      toast.success('Removed from favorites', { 
        id: `remove-${userId}`,
        action: {
          label: 'Undo',
          onClick: () => {
            if (favoriteToRemove) {
              setFavorites(prev => [...prev, favoriteToRemove].sort((a, b) => a.id - b.id));
            }
          },
        },
        duration: 5000,
      });
    } catch (error) {
      // Restore on error
      if (favoriteToRemove) {
        setFavorites(prev => [...prev, favoriteToRemove].sort((a, b) => a.id - b.id));
      }
      toast.error(error.response?.data?.error || 'Failed to remove favorite', { id: `remove-${userId}` });
    }
  };

  const handleMessage = async (userId) => {
    try {
      const response = await api.post('/conversations', { receiver_id: userId });
      navigate(`/messages?conversation=${response.data.id}`);
      toast.success('Opening conversation...');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to start conversation');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-pink-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-pink-50/30 to-purple-50/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Favorites</h1>
              <p className="text-gray-600">People you've marked as favorites</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                {favorites.length} {favorites.length === 1 ? 'Favorite' : 'Favorites'}
              </span>
            </div>
          </div>
        </div>

        {processedFavorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processedFavorites.map((favoriteData) => {
              const { user, profile, userId, displayName, images, hasMultipleImages } = favoriteData;
              
              // Ensure displayName is always available - double check at render time
              const safeDisplayName = displayName || 
                                     profile?.full_name || 
                                     (profile?.first_name ? `${profile.first_name} ${profile?.last_name || ''}`.trim() : null) ||
                                     user?.name ||
                                     'Unknown User';
              const currentIndex = currentImageIndices[favoriteData.id] || 0;
              
              const goToPrevious = (e) => {
                if (e) {
                  e.preventDefault();
                  e.stopPropagation();
                }
                setCurrentImageIndices(prev => ({
                  ...prev,
                  [favoriteData.id]: currentIndex === 0 ? images.length - 1 : currentIndex - 1
                }));
              };
              
              const goToNext = (e) => {
                if (e) {
                  e.preventDefault();
                  e.stopPropagation();
                }
                setCurrentImageIndices(prev => ({
                  ...prev,
                  [favoriteData.id]: currentIndex === images.length - 1 ? 0 : currentIndex + 1
                }));
              };
              
              // Swipe handlers
              const minSwipeDistance = 50;
              const handleTouchStart = (e) => {
                setTouchPositions(prev => ({
                  ...prev,
                  [favoriteData.id]: { start: e.targetTouches[0].clientX, end: null }
                }));
              };
              const handleTouchMove = (e) => {
                setTouchPositions(prev => ({
                  ...prev,
                  [favoriteData.id]: { ...prev[favoriteData.id], end: e.targetTouches[0].clientX }
                }));
              };
              const handleTouchEnd = () => {
                const touch = touchPositions[favoriteData.id];
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
                  [favoriteData.id]: { start: null, end: null }
                }));
              };

              return (
                <div key={favoriteData.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  {/* Image Carousel */}
                  <div 
                    className="relative h-[450px] bg-gradient-to-br from-pink-50 to-purple-50 select-none group/image-carousel"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    {/* Image Container */}
                    <div className="relative w-full h-full overflow-hidden rounded-t-2xl">
                      {images.map((imageUrl, index) => {
                        // Only render visible and adjacent images for performance
                        const shouldRender = index === currentIndex || 
                                           index === currentIndex - 1 || 
                                           index === currentIndex + 1 ||
                                           (currentIndex === 0 && index === images.length - 1) ||
                                           (currentIndex === images.length - 1 && index === 0);
                        
                        if (!shouldRender && images.length > 3) {
                          return null;
                        }
                        
                        return (
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
                              alt={`${safeDisplayName} - Image ${index + 1}`} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out" 
                              loading={index === 0 ? 'eager' : index <= currentIndex + 1 ? 'lazy' : 'lazy'}
                              decoding="async"
                              fetchPriority={index === 0 ? 'high' : 'low'}
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
                        );
                      })}
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
                                  [favoriteData.id]: index
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

                    {/* Favorite Badge */}
                    <div className="absolute top-4 left-4 z-20">
                      <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2 backdrop-blur-sm">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span className="text-xs font-bold">Favorite</span>
                      </div>
                    </div>

                    {/* Active Status */}
                    {profile?.is_active && (
                      <div className="absolute top-4 right-4 z-20">
                        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg">
                          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-gray-700 text-xs font-semibold">Active Now</span>
                        </div>
                      </div>
                    )}

                    {/* Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent pt-20 pb-5 px-5">
                      <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                        <h3 
                          className="text-2xl font-bold text-white tracking-tight min-w-0 flex-shrink-0" 
                          title={safeDisplayName}
                          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                        >
                          {safeDisplayName}
                        </h3>
                        {profile?.age && (
                          <span className="text-white/90 text-base font-medium whitespace-nowrap flex-shrink-0">{profile.age} years</span>
                        )}
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex items-center gap-5 text-white/95 text-sm flex-wrap">
                        {profile?.city && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="font-medium">{profile.city}</span>
                          </div>
                        )}
                        {profile?.profession && (
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="font-medium">{profile.profession}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="bg-white px-6 py-6 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/profile/${userId}`}
                        className="flex-1 px-6 py-3.5 bg-white border-2 border-gray-200 hover:border-pink-300 hover:bg-pink-50 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md text-gray-700 hover:text-pink-600 font-semibold"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>View Profile</span>
                      </Link>
                      <button
                        onClick={() => handleMessage(userId)}
                        className="flex-1 px-6 py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl text-white font-semibold"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>Message</span>
                      </button>
                      <button
                        onClick={() => removeFavorite(userId, favoriteData.id)}
                        className="px-6 py-3.5 bg-white border-2 border-red-200 hover:border-red-400 hover:bg-red-50 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md text-red-600 hover:text-red-700 font-semibold"
                        title="Remove from favorites"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Favorites Yet</h3>
            <p className="text-gray-600 mb-6">Start adding people to your favorites list to see them here!</p>
            <Link 
              to="/search" 
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Discover Profiles
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
