import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ProfileDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const response = await api.get(`/users/${id}`);
      setProfile(response.data);
    } catch (error) {
      toast.error('Failed to load profile');
      navigate('/search');
    } finally {
      setLoading(false);
    }
  };

  const sendInterest = async () => {
    try {
      await api.post('/interests', { receiver_id: id });
      toast.success('Interest sent successfully!');
    } catch (error) {
      toast.error(error.response?.data?.errors?.[0] || 'Failed to send interest');
    }
  };

  const addToFavorites = async () => {
    try {
      await api.post('/favorites', { user_id: id });
      toast.success('Added to favorites!');
    } catch (error) {
      toast.error(error.response?.data?.errors?.[0] || 'Failed to add to favorites');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const profileData = profile.profile || {};

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="aspect-square bg-gradient-to-br from-pink-200 to-rose-200 rounded-lg mb-4 flex items-center justify-center">
                {profileData.profile_picture_url ? (
                  <img src={profileData.profile_picture_url} alt={profileData.full_name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <div className="text-8xl text-pink-400">👤</div>
                )}
              </div>
              <div className="space-y-3">
                <button onClick={sendInterest} className="btn-primary w-full">
                  Send Interest
                </button>
                <button onClick={addToFavorites} className="btn-secondary w-full">
                  Add to Favorites
                </button>
              </div>
            </div>

            <div className="md:col-span-2">
              <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">
                {profileData.full_name || `${profileData.first_name} ${profileData.last_name || ''}`}
              </h1>

              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-3">Basic Information</h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Age:</span>
                      <span className="ml-2 font-medium">{profileData.age} years</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Height:</span>
                      <span className="ml-2 font-medium">{profileData.height} cm</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Gender:</span>
                      <span className="ml-2 font-medium capitalize">{profileData.gender}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Marital Status:</span>
                      <span className="ml-2 font-medium capitalize">{profileData.marital_status?.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">Family & Background</h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Religion:</span>
                      <span className="ml-2 font-medium">{profileData.religion}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Caste:</span>
                      <span className="ml-2 font-medium">{profileData.caste}</span>
                    </div>
                    {profileData.sub_caste && (
                      <div>
                        <span className="text-gray-600">Sub Caste:</span>
                        <span className="ml-2 font-medium">{profileData.sub_caste}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Diet:</span>
                      <span className="ml-2 font-medium capitalize">{profileData.diet?.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">Education & Career</h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Education:</span>
                      <span className="ml-2 font-medium">{profileData.education}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Profession:</span>
                      <span className="ml-2 font-medium">{profileData.profession}</span>
                    </div>
                    {profileData.annual_income && (
                      <div>
                        <span className="text-gray-600">Annual Income:</span>
                        <span className="ml-2 font-medium">₹{profileData.annual_income}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3">Location</h2>
                  <div className="text-sm">
                    <span className="text-gray-600">Location:</span>
                    <span className="ml-2 font-medium">
                      {profileData.city}, {profileData.state}, {profileData.country}
                    </span>
                  </div>
                </div>

                {profileData.about_me && (
                  <div>
                    <h2 className="text-xl font-semibold mb-3">About Me</h2>
                    <p className="text-gray-700">{profileData.about_me}</p>
                  </div>
                )}

                {profileData.family_details && (
                  <div>
                    <h2 className="text-xl font-semibold mb-3">Family Details</h2>
                    <p className="text-gray-700">{profileData.family_details}</p>
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

