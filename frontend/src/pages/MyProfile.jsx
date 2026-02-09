import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const PROFILE_IMAGES = [
  '/images/image1.jpg', '/images/image2.jpg', '/images/image3.jpg',
  '/images/image4.avif', '/images/image5.avif', '/images/image6.avif',
  '/images/image7.avif', '/images/image8.avif', '/images/image9.avif',
  '/images/image10.avif', '/images/image11.avif', '/images/image12.avif',
  '/images/image13.avif', '/images/image14.avif',
];

const getProfileImage = (profile) => {
  if (profile?.profile_picture_url) return profile.profile_picture_url;
  return PROFILE_IMAGES[(profile?.id || profile?.user_id || 0) % PROFILE_IMAGES.length];
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

  const getAllProfileImages = (profileData) => {
    if (!profileData) return [getProfileImage({})];
    const imageList = [];
    if (profileData.profile_picture_url) imageList.push(profileData.profile_picture_url);
    if (profileData.photos_urls?.length) imageList.push(...profileData.photos_urls);
    if (imageList.length === 0) imageList.push(getProfileImage(profileData));
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
      setCurrentImageIndex(0);
    } catch (error) {
      if (error.response?.status === 404) setProfile(null);
      else toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); fetchInterests(); }, []);
  useEffect(() => { if (location.pathname === '/profile') fetchProfile(); }, [location.pathname]);

  useEffect(() => {
    if (!hasMultipleImages) return;
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); goToPreviousImage(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); goToNextImage(); }
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
    const interestToCancel = sentInterests.find(i => i.id === interestId);
    setSentInterests(prev => prev.filter(i => i.id !== interestId));
    toast.success(
      (t) => (
        <div className="flex items-center gap-3">
          <span className="font-medium">Interest cancelled</span>
          <button onClick={() => { if (interestToCancel) setSentInterests(prev => [...prev, interestToCancel].sort((a, b) => a.id - b.id)); toast.dismiss(t.id); }} className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-all">Undo</button>
        </div>
      ), { duration: 5000, id: `cancel-${interestId}` }
    );
    try { await api.delete(`/interests/${interestId}`); }
    catch (error) {
      if (interestToCancel) setSentInterests(prev => [...prev, interestToCancel].sort((a, b) => a.id - b.id));
      toast.dismiss(`cancel-${interestId}`);
      toast.error(error.response?.data?.errors?.[0] || 'Failed to cancel interest');
    }
  };

  const fmt = (v) => v ? v.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '—';

  // --- Loading ---
  if (loading) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin h-10 w-10 border-[3px] border-pink-500 border-t-transparent rounded-full"></div>
          <p className="mt-3 text-sm text-gray-500 font-medium tracking-wide">Loading profile...</p>
        </div>
      </div>
    );
  }

  // --- No Profile ---
  if (!profile) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">No Profile Yet</h2>
          <p className="text-gray-500 mb-8 text-sm leading-relaxed">Create your profile to start finding your perfect match</p>
          <Link to="/profile/create" className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg hover:shadow-xl">
            Create Profile
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </Link>
        </div>
      </div>
    );
  }

  // --- Detail Item ---
  const DetailItem = ({ icon, label, value, color = 'pink' }) => {
    if (!value || value === '—') return null;
    const colors = {
      pink: 'bg-pink-50 text-pink-600',
      blue: 'bg-blue-50 text-blue-600',
      purple: 'bg-purple-50 text-purple-600',
      green: 'bg-green-50 text-green-600',
      amber: 'bg-amber-50 text-amber-600',
      indigo: 'bg-indigo-50 text-indigo-600',
      cyan: 'bg-cyan-50 text-cyan-600',
      rose: 'bg-rose-50 text-rose-600',
      emerald: 'bg-emerald-50 text-emerald-600',
    };
    return (
      <div className="flex items-center gap-3 py-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold leading-none mb-0.5">{label}</div>
          <div className="text-[13px] font-semibold text-gray-800 truncate">{value}</div>
        </div>
      </div>
    );
  };

  // --- Profile Tab Content ---
  const ProfileContent = () => (
    <div className="h-[calc(100vh-64px)] flex flex-col lg:flex-row overflow-hidden">
      {/* Left — Photo */}
      <div className="relative w-full lg:w-[420px] xl:w-[480px] flex-shrink-0 h-[45vh] lg:h-full bg-black"
        onTouchStart={(e) => { setTouchStart(e.targetTouches[0].clientX); setTouchEnd(null); }}
        onTouchMove={(e) => setTouchEnd(e.targetTouches[0].clientX)}
        onTouchEnd={() => {
          if (!touchStart || !touchEnd) { setTouchStart(null); setTouchEnd(null); return; }
          const d = touchStart - touchEnd;
          if (d > 50 && hasMultipleImages) goToNextImage();
          if (d < -50 && hasMultipleImages) goToPreviousImage();
          setTouchStart(null); setTouchEnd(null);
        }}
      >
        {images.map((url, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-500 ${i === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
            <img src={url} alt={`${profile.first_name} ${i + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
        {/* Gradient overlay */}
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-black/10 to-black/30 pointer-events-none" />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-5">
          <div className="flex items-center gap-2">
            {hasMultipleImages && (
              <div className="flex gap-1.5">
                {images.map((_, i) => (
                  <button key={i} onClick={() => setCurrentImageIndex(i)} className={`h-1 rounded-full transition-all duration-300 ${i === currentImageIndex ? 'w-6 bg-white' : 'w-3 bg-white/40 hover:bg-white/60'}`} />
                ))}
              </div>
            )}
          </div>
          {hasMultipleImages && (
            <span className="text-xs font-medium text-white/70 bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full">{currentImageIndex + 1}/{images.length}</span>
          )}
        </div>

        {/* Arrows */}
        {hasMultipleImages && (
          <>
            <button onClick={goToPreviousImage} className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/15 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={goToNextImage} className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/15 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </>
        )}

        {/* Bottom info on photo */}
        <div className="absolute bottom-0 left-0 right-0 z-30 p-6">
          <h1 className="text-3xl font-bold text-white tracking-tight leading-tight mb-1">
            {profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim()}
          </h1>
          <div className="flex items-center gap-3 text-white/80 text-sm font-medium">
            <span>{profile.age} years</span>
            {profile.city && <><span className="text-white/40">|</span><span>{profile.city}, {profile.state}</span></>}
          </div>
        </div>
      </div>

      {/* Right — Details */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {/* Action bar */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-100">
          <div className="flex items-center justify-between px-6 lg:px-8 py-3">
            <div className="flex items-center gap-5">
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">My Profile</h2>
              <div className="hidden sm:flex items-center gap-1 text-xs font-medium text-gray-400">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Online
              </div>
            </div>
            <Link to="/profile/edit" className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all shadow-sm hover:shadow-md uppercase tracking-wider">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              Edit
            </Link>
          </div>
        </div>

        <div className="px-6 lg:px-8 py-5 space-y-5">
          {/* About Me */}
          {profile.about_me && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-sm text-gray-700 leading-relaxed italic">"{profile.about_me}"</p>
            </div>
          )}

          {/* Quick Stats Row */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Height', value: profile.height ? `${profile.height} cm` : '—', emoji: '📏' },
              { label: 'Status', value: fmt(profile.marital_status), emoji: '💍' },
              { label: 'Diet', value: fmt(profile.diet), emoji: '🍽️' },
              { label: 'Religion', value: profile.religion || '—', emoji: '🕉️' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                <div className="text-lg mb-1">{s.emoji}</div>
                <div className="text-xs font-bold text-gray-900 truncate">{s.value}</div>
                <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Two column details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Education & Career */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Education & Career</h3>
              <div className="space-y-1">
                <DetailItem color="blue" label="Education" value={profile.education} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>} />
                <DetailItem color="purple" label="Profession" value={profile.profession} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} />
                <DetailItem color="green" label="Income" value={profile.annual_income ? `₹${Number(profile.annual_income).toLocaleString('en-IN')}` : null} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
              </div>
            </div>

            {/* Background */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Background</h3>
              <div className="space-y-1">
                <DetailItem color="pink" label="Religion" value={profile.religion} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} />
                <DetailItem color="indigo" label="Caste" value={profile.caste} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                {profile.sub_caste && <DetailItem color="amber" label="Sub Caste" value={profile.sub_caste} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>} />}
              </div>
            </div>

            {/* Lifestyle */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Lifestyle</h3>
              <div className="space-y-1">
                <DetailItem color="emerald" label="Diet" value={fmt(profile.diet)} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>} />
                <DetailItem color="cyan" label="Drinking" value={fmt(profile.drinking)} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>} />
                <DetailItem color="rose" label="Smoking" value={fmt(profile.smoking)} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>} />
              </div>
            </div>

            {/* Location & Family */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Location & Family</h3>
              <div className="space-y-1">
                <DetailItem color="blue" label="Location" value={[profile.city, profile.state, profile.country].filter(Boolean).join(', ') || null} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
                {profile.native_place && <DetailItem color="amber" label="Native Place" value={profile.native_place} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>} />}
                {profile.father_name && <DetailItem color="indigo" label="Father" value={profile.father_name} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} />}
                {profile.mother_name && <DetailItem color="pink" label="Mother" value={profile.mother_name} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} />}
                {profile.siblings && <DetailItem color="purple" label="Siblings" value={profile.siblings} icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} />}
              </div>
            </div>
          </div>

          {/* Languages & Family Details (compact row) */}
          {(profile.languages_spoken || profile.family_details) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.languages_spoken && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.languages_spoken.split(',').map((lang, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-50 text-gray-700 text-xs font-semibold rounded-full border border-gray-200">{lang.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
              {profile.family_details && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Family Details</h3>
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">{profile.family_details}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // --- Interest Card ---
  const InterestCard = ({ interest, type }) => {
    const profileData = interest.profile_data || (type === 'sent' ? interest.receiver?.profile : interest.sender?.profile) || {};
    const status = interest.status || 'pending';
    const userId = type === 'sent' ? (interest.receiver_id || interest.receiver?.id) : (interest.sender_id || interest.sender?.id);

    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
        <div className="relative h-56 bg-gray-100 overflow-hidden">
          <img src={getProfileImage(profileData)} alt={profileData.full_name || profileData.first_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
          <div className="w-full h-full hidden items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50"><div className="text-6xl text-pink-200">👤</div></div>

          {/* Status pill */}
          <div className="absolute top-3 left-3">
            <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-lg ${
              status === 'accepted' ? 'bg-emerald-500 text-white' : status === 'rejected' ? 'bg-red-500 text-white' : 'bg-amber-400 text-white'
            }`}>{status === 'accepted' ? 'Accepted' : status === 'rejected' ? 'Rejected' : 'Pending'}</span>
          </div>

          {/* Info overlay */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent pt-10 pb-3 px-4">
            <h3 className="text-base font-bold text-white truncate">{profileData.full_name || `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim()}</h3>
            <p className="text-xs text-white/80 font-medium">{profileData.age} yrs{profileData.city ? ` · ${profileData.city}` : ''}</p>
          </div>
        </div>

        <div className="p-3 flex gap-2">
          <Link to={`/profile/${userId}`} className="flex-1 py-2 text-center text-xs font-bold text-pink-600 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors">View</Link>
          {type === 'sent' && status === 'pending' && (
            <button onClick={() => handleCancelInterest(interest.id)} className="flex-1 py-2 text-center text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">Cancel</button>
          )}
          {type === 'sent' && status === 'accepted' && (
            <button onClick={() => navigate(`/messages?conversation=${interest.id}`)} className="flex-1 py-2 text-center text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">Message</button>
          )}
          {type === 'received' && status === 'pending' && (
            <>
              <button onClick={() => handleAcceptInterest(interest.id)} className="flex-1 py-2 text-center text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">Accept</button>
              <button onClick={() => handleRejectInterest(interest.id)} className="flex-1 py-2 text-center text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">Reject</button>
            </>
          )}
        </div>
      </div>
    );
  };

  // --- Interest Tab Content ---
  const InterestsContent = ({ interests, type }) => (
    <div className="h-[calc(100vh-64px)] overflow-y-auto bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            {type === 'sent' ? 'Sent' : 'Received'} Interests
            <span className="ml-2 text-sm font-medium text-gray-400">({interests.length})</span>
          </h2>
        </div>
        {interestsLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin h-8 w-8 border-[3px] border-pink-500 border-t-transparent rounded-full"></div>
          </div>
        ) : interests.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {interests.map((interest) => <InterestCard key={interest.id} interest={interest} type={type} />)}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-pink-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">No {type === 'sent' ? 'sent' : 'received'} interests</h3>
            <p className="text-sm text-gray-400">{type === 'sent' ? "You haven't sent any interest requests yet." : "No one has sent you an interest request yet."}</p>
          </div>
        )}
      </div>
    </div>
  );

  // ====== MAIN RENDER ======
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Tab bar */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0 z-30">
        <div className="flex">
          {[
            { key: 'profile', label: 'Profile', count: null },
            { key: 'sent', label: 'Sent', count: sentInterests.length },
            { key: 'received', label: 'Received', count: receivedInterests.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 relative py-3 text-xs font-bold uppercase tracking-widest transition-colors ${
                activeTab === tab.key
                  ? 'text-pink-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                {tab.label}
                {tab.count > 0 && (
                  <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                    activeTab === tab.key ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>{tab.count}</span>
                )}
              </span>
              {activeTab === tab.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500" />}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'profile' && <ProfileContent />}
        {activeTab === 'sent' && <InterestsContent interests={sentInterests} type="sent" />}
        {activeTab === 'received' && <InterestsContent interests={receivedInterests} type="received" />}
      </div>
    </div>
  );
};

export default MyProfile;
