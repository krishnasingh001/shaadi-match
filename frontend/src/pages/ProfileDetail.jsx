import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  // Use profile ID to consistently assign an image
  const imageIndex = (profile?.id || profile?.user_id || 0) % PROFILE_IMAGES.length;
  return PROFILE_IMAGES[imageIndex];
};

const ProfileDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      // Try profile endpoint first, fallback to user endpoint
      let response;
      try {
        response = await api.get(`/users/${id}/profile`);
        setProfile(response.data);
      } catch (profileError) {
        // Fallback to user endpoint
        response = await api.get(`/users/${id}`);
        setProfile(response.data.profile || response.data);
      }
    } catch (error) {
      toast.error('Failed to load profile');
      navigate('/search');
    } finally {
      setLoading(false);
    }
  };

  const sendInterest = async () => {
    setActionLoading(prev => ({ ...prev, interest: true }));
    try {
      await api.post('/interests', { receiver_id: id });
      toast.success('Interest sent successfully!');
    } catch (error) {
      toast.error(error.response?.data?.errors?.[0] || 'Failed to send interest');
    } finally {
      setActionLoading(prev => ({ ...prev, interest: false }));
    }
  };

  const addToFavorites = async () => {
    setActionLoading(prev => ({ ...prev, favorite: true }));
    try {
      await api.post('/favorites', { user_id: id });
      toast.success('Added to favorites!');
    } catch (error) {
      toast.error(error.response?.data?.errors?.[0] || 'Failed to add to favorites');
    } finally {
      setActionLoading(prev => ({ ...prev, favorite: false }));
    }
  };

  const startConversation = async () => {
    setActionLoading(prev => ({ ...prev, message: true }));
    try {
      const response = await api.post('/conversations', { receiver_id: id });
      navigate(`/messages?conversation=${response.data.id}`);
      toast.success('Opening conversation...');
    } catch (error) {
      toast.error(error.response?.data?.errors?.[0] || 'Failed to start conversation');
    } finally {
      setActionLoading(prev => ({ ...prev, message: false }));
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
    return null;
  }

  const profileData = profile || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back to Search</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Profile Image & Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-24">
              {/* Profile Image */}
              <div className="relative h-[500px] bg-gradient-to-br from-pink-50 to-purple-50 overflow-hidden">
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
                  <div className="text-9xl text-pink-300">👤</div>
                </div>

                {/* Status Badge */}
                <div className="absolute top-5 left-5 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-700 text-xs font-semibold">Active Now</span>
                </div>

                {/* Verified Badge */}
                <div className="absolute top-5 right-5 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 space-y-3">
                <button 
                  onClick={sendInterest}
                  disabled={actionLoading.interest}
                  className="w-full px-6 py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {actionLoading.interest ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
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
                  onClick={addToFavorites}
                  disabled={actionLoading.favorite}
                  className="w-full px-6 py-3.5 bg-white border-2 border-pink-300 hover:border-pink-500 hover:bg-pink-50 text-pink-600 text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {actionLoading.favorite ? (
                    <>
                      <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <span>Add to Favorites</span>
                    </>
                  )}
                </button>
                <button 
                  onClick={startConversation}
                  disabled={actionLoading.message}
                  className="w-full px-6 py-3.5 bg-white border-2 border-gray-200 hover:border-gray-400 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {actionLoading.message ? (
                    <>
                      <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Opening...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Name & Basic Info Header */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    {profileData.full_name || `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim()}
                  </h1>
                  <div className="flex items-center gap-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">{profileData.age} years old</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="font-medium">{profileData.city}, {profileData.state}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-100">
                <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl">
                  <div className="text-2xl font-bold text-gray-900">{profileData.height || 'N/A'}</div>
                  <div className="text-xs text-gray-600 font-medium mt-1">Height (cm)</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                  <div className="text-2xl font-bold text-gray-900">{formatEnum(profileData.marital_status)}</div>
                  <div className="text-xs text-gray-600 font-medium mt-1">Status</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                  <div className="text-2xl font-bold text-gray-900">{formatEnum(profileData.diet)}</div>
                  <div className="text-xs text-gray-600 font-medium mt-1">Diet</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl">
                  <div className="text-2xl font-bold text-gray-900">{profileData.religion || 'N/A'}</div>
                  <div className="text-xs text-gray-600 font-medium mt-1">Religion</div>
                </div>
              </div>
            </div>

            {/* About Me */}
            {profileData.about_me && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-8 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full"></div>
                  About Me
                </h2>
                <p className="text-gray-700 leading-relaxed">{profileData.about_me}</p>
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
                    <div className="text-lg font-semibold text-gray-900">{profileData.education || 'Not specified'}</div>
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
                    <div className="text-lg font-semibold text-gray-900">{profileData.profession || 'Not specified'}</div>
                  </div>
                </div>
                {profileData.annual_income && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 font-medium mb-1">Annual Income</div>
                      <div className="text-lg font-semibold text-gray-900">₹{profileData.annual_income.toLocaleString('en-IN')}</div>
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
                    <div className="text-lg font-semibold text-gray-900">{profileData.religion || 'Not specified'}</div>
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
                    <div className="text-lg font-semibold text-gray-900">{profileData.caste || 'Not specified'}</div>
                  </div>
                </div>
                {profileData.sub_caste && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 font-medium mb-1">Sub Caste</div>
                      <div className="text-lg font-semibold text-gray-900">{profileData.sub_caste}</div>
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
                      {formatEnum(profileData.diet)} • {formatEnum(profileData.drinking)} • {formatEnum(profileData.smoking)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Family Details */}
            {profileData.family_details && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
                  Family Details
                </h2>
                <div className="space-y-4">
                  {profileData.father_name && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Father's Name</div>
                        <div className="font-semibold text-gray-900">{profileData.father_name}</div>
                      </div>
                    </div>
                  )}
                  {profileData.mother_name && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Mother's Name</div>
                        <div className="font-semibold text-gray-900">{profileData.mother_name}</div>
                      </div>
                    </div>
                  )}
                  {profileData.siblings && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Siblings</div>
                        <div className="font-semibold text-gray-900">{profileData.siblings}</div>
                      </div>
                    </div>
                  )}
                  <p className="text-gray-700 leading-relaxed mt-4 pt-4 border-t border-gray-100">{profileData.family_details}</p>
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-1 h-8 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
                Additional Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profileData.native_place && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 font-medium mb-1">Native Place</div>
                      <div className="text-lg font-semibold text-gray-900">{profileData.native_place}</div>
                    </div>
                  </div>
                )}
                {profileData.languages_spoken && (
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 font-medium mb-1">Languages</div>
                      <div className="text-lg font-semibold text-gray-900">{profileData.languages_spoken}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetail;
