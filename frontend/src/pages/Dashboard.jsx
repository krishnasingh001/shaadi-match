import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  if (profile.profile_picture_url) {
    return profile.profile_picture_url;
  }
  const imageIndex = (profile.id || profile.user_id || 0) % PROFILE_IMAGES.length;
  return PROFILE_IMAGES[imageIndex];
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [suggestedMatches, setSuggestedMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    sentInterests: 0,
    receivedInterests: 0,
    favorites: 0,
    conversations: 0,
  });
  const [loadingActions, setLoadingActions] = useState({});
  const [heartAnimations, setHeartAnimations] = useState({});

  useEffect(() => {
    fetchSuggestedMatches();
    fetchProfile();
    fetchStats();
  }, []);

  const fetchSuggestedMatches = async () => {
    try {
      const response = await api.get('/matches/suggested');
      setSuggestedMatches(response.data.matches || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch sent interests
      const sentResponse = await api.get('/interests?type=sent');
      const sentInterests = sentResponse.data || [];
      
      // Fetch received interests
      const receivedResponse = await api.get('/interests?type=received');
      const receivedInterests = receivedResponse.data || [];
      
      // Fetch favorites
      const favoritesResponse = await api.get('/favorites');
      const favorites = favoritesResponse.data || [];
      
      // Fetch conversations
      const conversationsResponse = await api.get('/conversations');
      const conversations = conversationsResponse.data || [];
      
      setStats({
        sentInterests: sentInterests.length,
        receivedInterests: receivedInterests.length,
        favorites: favorites.length,
        conversations: conversations.length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const sendInterest = async (userId, profileId) => {
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
      setSuggestedMatches(prev => prev.filter(m => (m.user_id || m.id) !== userId));
      
      // Show appropriate message based on response
      if (response.data.message === 'Interest already sent') {
        toast.success('Interest already sent!');
      } else {
      toast.success('Interest sent successfully!');
      }
      fetchStats(); // Refresh stats
    } catch (error) {
      const errorMessage = error.response?.data?.errors?.[0] || 'Failed to send interest';
      
      // Handle specific error messages more gracefully
      if (errorMessage.includes('already been taken') || errorMessage.includes('already sent')) {
        toast.success('Interest already sent!');
        // Still remove from view since interest exists
        setSuggestedMatches(prev => prev.filter(m => (m.user_id || m.id) !== userId));
        fetchStats(); // Refresh stats even if already sent
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

  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const calculateProfileCompletion = () => {
    if (!profile) return 0;
    
    const fields = [
      profile.first_name,
      profile.last_name,
      profile.date_of_birth,
      profile.gender,
      profile.height,
      profile.religion,
      profile.caste,
      profile.education,
      profile.profession,
      profile.city,
      profile.state,
      profile.family_background,
      profile.about_me,
    ];
    
    const filledFields = fields.filter(field => field && field.toString().trim() !== '').length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-3 border-pink-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-pink-50/20 to-purple-50/20">
      {/* Enhanced Hero Section */}
      <div className="relative bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 text-white overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
                  <span className="text-3xl">👋</span>
                </div>
                <div>
                  <p className="text-pink-100 text-sm font-medium mb-1">Welcome back</p>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                    {profile?.first_name || user?.email?.split('@')[0] || 'User'}
                  </h1>
                </div>
              </div>
              <p className="text-pink-100 text-xl md:text-2xl font-semibold mb-3 italic">
                Dating with intent. Marriage by choice.
              </p>
              <p className="text-pink-100 text-lg md:text-xl max-w-2xl">
                {suggestedMatches.length > 0 
                  ? `✨ We've curated ${suggestedMatches.length} perfect matches just for you`
                  : '🚀 Complete your profile to unlock personalized matches'}
              </p>
              
              {/* Quick Stats in Hero */}
              {profile && stats.receivedInterests > 0 && (
                <div className="mt-6 flex items-center gap-4">
                  <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      <span className="font-bold">{stats.receivedInterests}</span>
                      <span className="text-sm text-pink-100">New Interests</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {profile && (
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 shadow-xl min-w-[280px]">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-pink-100 font-semibold">Profile Completion</div>
                  <span className="text-3xl font-bold">{profileCompletion}%</span>
                </div>
                <div className="relative bg-white/20 rounded-full h-4 overflow-hidden mb-3">
                  <div 
                    className="h-full bg-gradient-to-r from-white to-pink-100 rounded-full transition-all duration-700 shadow-lg"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
                {profileCompletion < 100 && (
                  <Link 
                    to="/profile/edit"
                    className="text-xs text-pink-100 hover:text-white font-medium underline flex items-center gap-1"
                  >
                    Complete profile →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Completion Banner - Enhanced */}
        {!profile && (
          <div className="mb-8 bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 rounded-3xl shadow-2xl overflow-hidden relative">
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}
            ></div>
            <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-center justify-between text-white">
              <div className="mb-6 md:mb-0 flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
              <div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-1">Complete Your Profile</h3>
                    <p className="text-pink-100 text-base md:text-lg">Unlock personalized matches and increase your chances of finding the perfect match</p>
                  </div>
                </div>
              </div>
              <Link 
                to="/profile/create" 
                className="px-8 py-4 bg-white text-pink-600 rounded-xl font-bold hover:bg-pink-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 whitespace-nowrap flex items-center gap-2"
              >
                <span>Create Profile Now</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        )}

        {/* Enhanced Stats Cards */}
        {profile && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <Link 
              to="/profile" 
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-pink-300 group relative overflow-hidden"
            >
              {/* Animated Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-rose-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                  {stats.receivedInterests > 0 && (
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-1 group-hover:text-pink-600 transition-colors">{stats.receivedInterests}</div>
                <div className="text-sm text-gray-600 font-semibold">Received Interests</div>
                <div className="mt-3 text-xs text-gray-500 group-hover:text-pink-600 transition-colors flex items-center gap-1">
                  <span>View all</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            <Link 
              to="/profile?tab=sent" 
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{stats.sentInterests}</div>
                <div className="text-sm text-gray-600 font-semibold">Sent Interests</div>
                <div className="mt-3 text-xs text-gray-500 group-hover:text-blue-600 transition-colors flex items-center gap-1">
                  <span>View all</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

                  <Link
              to="/favorites" 
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-yellow-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-1 group-hover:text-yellow-600 transition-colors">{stats.favorites}</div>
                <div className="text-sm text-gray-600 font-semibold">Favorites</div>
                <div className="mt-3 text-xs text-gray-500 group-hover:text-yellow-600 transition-colors flex items-center gap-1">
                  <span>View all</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
                  </Link>

            <Link 
              to="/messages" 
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-green-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  {stats.conversations > 0 && (
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">{stats.conversations}</div>
                <div className="text-sm text-gray-600 font-semibold">Conversations</div>
                <div className="mt-3 text-xs text-gray-500 group-hover:text-green-600 transition-colors flex items-center gap-1">
                  <span>View all</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Enhanced Suggested Matches Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Suggested Matches</h2>
                    <p className="text-gray-600 mt-1 text-sm md:text-base">
                      {suggestedMatches.length > 0 
                        ? `Handpicked profiles based on your preferences`
                        : 'Complete your profile to see personalized matches'}
                    </p>
                  </div>
                </div>
              </div>
              {suggestedMatches.length > 0 && (
                <Link 
                  to="/search" 
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 whitespace-nowrap"
                >
                  <span>Discover All</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              )}
            </div>
          </div>

          {suggestedMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestedMatches.map((match) => {
                const profileId = match.id || match.user_id;
                const userId = match.user_id || match.id;
                const isLoading = loadingActions[userId];
                
                return (
                  <div 
                    key={profileId} 
                    className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group border border-gray-100"
                  >
                    {/* Profile Image - Enhanced */}
                    <div className="relative h-[400px] bg-gradient-to-br from-pink-50 to-purple-50 overflow-hidden">
                      <img 
                        src={getProfileImage(match)} 
                        alt={match.name || match.full_name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                        onError={(e) => {
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
                            const randomX = 5 + Math.random() * 90;
                            const randomDelay = i * 0.03 + Math.random() * 0.05;
                            const randomDuration = 2 + Math.random() * 0.8;
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
                      
                      {/* Enhanced Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                        <span className="px-4 py-2 bg-white/95 backdrop-blur-md text-sm font-bold text-gray-800 rounded-full shadow-lg border border-white/50">
                          {match.age} years
                        </span>
                        {match.is_active && (
                          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-white/50">
                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-gray-800 text-xs font-bold">Active Now</span>
                          </div>
                        )}
                      </div>

                      {/* Enhanced View Profile Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 group-hover:from-black/70 transition-all duration-300 flex items-end justify-center pb-6 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => handleViewProfile(userId)}
                          className="px-6 py-3 bg-white text-gray-900 font-bold rounded-xl shadow-2xl hover:bg-pink-50 hover:text-pink-600 transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 flex items-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>View Full Profile</span>
                        </button>
                      </div>

                      {/* Info Overlay - Bottom */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent pt-20 pb-5 px-5">
                        <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
                          {match.name || match.full_name}
                        </h3>
                        <div className="flex items-center gap-4 text-white/95 text-sm font-medium">
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{match.city}, {match.state}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Profile Info */}
                    <div className="p-6 bg-white">
                      {/* Quick Info Icons */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-pink-50 transition-colors">
                          <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-medium">Height</div>
                            <div className="text-sm font-bold text-gray-900">{match.height} cm</div>
                          </div>
                        </div>
                        {match.education && (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 font-medium">Education</div>
                              <div className="text-sm font-bold text-gray-900 truncate">{match.education}</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Enhanced Action Buttons */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => sendInterest(userId, profileId)}
                          disabled={isLoading}
                          className="flex-1 px-5 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-bold hover:from-pink-600 hover:to-rose-600 transition-all duration-200 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isLoading === 'like' ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                              </svg>
                              <span>Send Interest</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleViewProfile(userId)}
                          className="px-5 py-3 bg-white border-2 border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 hover:border-pink-300 hover:text-pink-600 transition-all duration-200 rounded-xl shadow-sm hover:shadow-md flex items-center justify-center"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 md:p-16 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No matches found yet</h3>
              <p className="text-gray-600 text-base mb-8 max-w-md mx-auto">
                {profile 
                  ? 'Complete your profile and partner preferences to unlock personalized matches tailored just for you!'
                  : 'Create your profile to start discovering amazing matches!'}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {!profile ? (
                  <Link 
                    to="/profile/create" 
                    className="px-8 py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-bold hover:from-pink-600 hover:to-rose-600 transition-all duration-200 rounded-xl shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <span>Create Profile Now</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                ) : (
                  <>
                    <Link 
                      to="/profile/edit" 
                      className="px-8 py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-bold hover:from-pink-600 hover:to-rose-600 transition-all duration-200 rounded-xl shadow-lg hover:shadow-xl"
                    >
                      Complete Profile
                    </Link>
                    <Link 
                      to="/search" 
                      className="px-8 py-3.5 bg-white border-2 border-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-50 hover:border-pink-300 hover:text-pink-600 transition-all duration-200 rounded-xl shadow-sm hover:shadow-md"
                    >
                      Browse All Profiles
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
