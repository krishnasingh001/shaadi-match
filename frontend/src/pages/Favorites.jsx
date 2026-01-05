import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await api.get('/favorites');
      setFavorites(response.data || []);
    } catch (error) {
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (userId) => {
    try {
      await api.delete(`/favorites/${userId}`);
      toast.success('Removed from favorites');
      setFavorites(favorites.filter(fav => fav.favorite_user_id !== userId));
    } catch (error) {
      toast.error('Failed to remove favorite');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-8">My Favorites</h1>

        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => {
              const user = favorite.favorite_user;
              const profile = user?.profile || {};
              return (
                <div key={favorite.id} className="card">
                  <div className="aspect-square bg-gradient-to-br from-pink-200 to-rose-200 rounded-lg mb-4 flex items-center justify-center">
                    {profile.profile_picture_url ? (
                      <img src={profile.profile_picture_url} alt={profile.full_name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="text-6xl text-pink-400">👤</div>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {profile.full_name || `${profile.first_name} ${profile.last_name || ''}`}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600 mb-4">
                    {profile.age && <p>{profile.age} years old</p>}
                    {profile.height && <p>{profile.height} cm</p>}
                    {profile.education && <p>{profile.education}</p>}
                    {profile.city && <p>{profile.city}, {profile.state}</p>}
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/profile/${user.id}`}
                      className="btn-secondary flex-1 text-center text-sm"
                    >
                      View Profile
                    </Link>
                    <button
                      onClick={() => removeFavorite(user.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">You haven't added any favorites yet.</p>
            <Link to="/search" className="btn-primary">
              Browse Matches
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;

