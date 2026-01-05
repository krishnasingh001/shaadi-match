import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const MyProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      setProfile(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        // Profile doesn't exist yet
        setProfile(null);
      } else {
        toast.error('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="card bg-gradient-to-r from-pink-500 to-rose-500 text-white text-center py-12">
            <h2 className="text-3xl font-serif font-bold mb-4">No Profile Found</h2>
            <p className="text-pink-100 mb-6">Create your profile to get started with finding your perfect match!</p>
            <Link to="/profile/create" className="bg-white text-pink-600 px-8 py-3 rounded-lg font-semibold hover:bg-pink-50 transition-colors inline-block">
              Create Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatEnum = (value) => {
    if (!value) return 'N/A';
    return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-4xl font-serif font-bold text-gray-900">My Profile</h1>
          <Link to="/profile/edit" className="btn-primary">
            Edit Profile
          </Link>
        </div>

        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="aspect-square bg-gradient-to-br from-pink-200 to-rose-200 rounded-lg mb-4 flex items-center justify-center">
                {profile.profile_picture_url ? (
                  <img src={profile.profile_picture_url} alt={profile.full_name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <div className="text-8xl text-pink-400">👤</div>
                )}
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
                  {profile.full_name || `${profile.first_name} ${profile.last_name || ''}`}
                </h2>
                <p className="text-gray-600">{profile.age} years old</p>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-3 text-gray-900">Basic Information</h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Age:</span>
                      <span className="ml-2 font-medium">{profile.age} years</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Height:</span>
                      <span className="ml-2 font-medium">{profile.height} cm</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Gender:</span>
                      <span className="ml-2 font-medium capitalize">{profile.gender}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Marital Status:</span>
                      <span className="ml-2 font-medium">{formatEnum(profile.marital_status)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Date of Birth:</span>
                      <span className="ml-2 font-medium">{new Date(profile.date_of_birth).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3 text-gray-900">Family & Background</h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Religion:</span>
                      <span className="ml-2 font-medium">{profile.religion}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Caste:</span>
                      <span className="ml-2 font-medium">{profile.caste}</span>
                    </div>
                    {profile.sub_caste && (
                      <div>
                        <span className="text-gray-600">Sub Caste:</span>
                        <span className="ml-2 font-medium">{profile.sub_caste}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Diet:</span>
                      <span className="ml-2 font-medium">{formatEnum(profile.diet)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Drinking:</span>
                      <span className="ml-2 font-medium">{formatEnum(profile.drinking)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Smoking:</span>
                      <span className="ml-2 font-medium">{formatEnum(profile.smoking)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3 text-gray-900">Education & Career</h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Education:</span>
                      <span className="ml-2 font-medium">{profile.education}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Profession:</span>
                      <span className="ml-2 font-medium">{profile.profession}</span>
                    </div>
                    {profile.annual_income && (
                      <div>
                        <span className="text-gray-600">Annual Income:</span>
                        <span className="ml-2 font-medium">₹{profile.annual_income.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-3 text-gray-900">Location</h2>
                  <div className="text-sm">
                    <span className="text-gray-600">Location:</span>
                    <span className="ml-2 font-medium">
                      {profile.city}, {profile.state}, {profile.country}
                    </span>
                  </div>
                  {profile.native_place && (
                    <div className="text-sm mt-2">
                      <span className="text-gray-600">Native Place:</span>
                      <span className="ml-2 font-medium">{profile.native_place}</span>
                    </div>
                  )}
                </div>

                {profile.about_me && (
                  <div>
                    <h2 className="text-xl font-semibold mb-3 text-gray-900">About Me</h2>
                    <p className="text-gray-700">{profile.about_me}</p>
                  </div>
                )}

                {profile.family_details && (
                  <div>
                    <h2 className="text-xl font-semibold mb-3 text-gray-900">Family Details</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {profile.father_name && (
                        <div>
                          <span className="text-gray-600">Father's Name:</span>
                          <span className="ml-2 font-medium">{profile.father_name}</span>
                        </div>
                      )}
                      {profile.mother_name && (
                        <div>
                          <span className="text-gray-600">Mother's Name:</span>
                          <span className="ml-2 font-medium">{profile.mother_name}</span>
                        </div>
                      )}
                      {profile.siblings && (
                        <div>
                          <span className="text-gray-600">Siblings:</span>
                          <span className="ml-2 font-medium">{profile.siblings}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-700 mt-4">{profile.family_details}</p>
                  </div>
                )}

                {profile.languages_spoken && (
                  <div>
                    <h2 className="text-xl font-semibold mb-3 text-gray-900">Languages</h2>
                    <p className="text-gray-700">{profile.languages_spoken}</p>
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

export default MyProfile;

