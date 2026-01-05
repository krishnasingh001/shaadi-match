import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [suggestedMatches, setSuggestedMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchSuggestedMatches();
    fetchProfile();
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

  const sendInterest = async (userId) => {
    try {
      await api.post('/interests', { receiver_id: userId });
      toast.success('Interest sent successfully!');
    } catch (error) {
      toast.error(error.response?.data?.errors?.[0] || 'Failed to send interest');
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

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
            Welcome back, {user?.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600">Here are some matches we think you'll like</p>
        </div>

        {!profile && (
          <div className="card bg-gradient-to-r from-pink-500 to-rose-500 text-white mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold mb-2">Complete Your Profile</h3>
                <p className="text-pink-100">Add your details to get better matches</p>
              </div>
              <Link to="/profile/create" className="bg-white text-pink-600 px-6 py-3 rounded-lg font-semibold hover:bg-pink-50 transition-colors">
                Create Profile
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestedMatches.length > 0 ? (
            suggestedMatches.map((match) => (
              <div key={match.id} className="card">
                <div className="aspect-square bg-gradient-to-br from-pink-200 to-rose-200 rounded-lg mb-4 flex items-center justify-center">
                  {match.profile_picture_url ? (
                    <img src={match.profile_picture_url} alt={match.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <div className="text-6xl text-pink-400">👤</div>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{match.name}</h3>
                <div className="space-y-1 text-sm text-gray-600 mb-4">
                  <p>{match.age} years old</p>
                  <p>{match.height} cm</p>
                  <p>{match.education}</p>
                  <p>{match.profession}</p>
                  <p>{match.city}, {match.state}</p>
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/profile/${match.user_id}`}
                    className="btn-secondary flex-1 text-center text-sm"
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={() => sendInterest(match.user_id)}
                    className="btn-primary flex-1 text-sm"
                  >
                    Send Interest
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 text-lg">No matches found. Complete your profile to get better matches!</p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link to="/search" className="btn-primary">
            Browse All Matches
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

