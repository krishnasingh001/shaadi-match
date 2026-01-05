import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Search = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    searchProfiles();
  }, [page]);

  const searchProfiles = async () => {
    setLoading(true);
    try {
      const params = { ...filters, page };
      const response = await api.get('/search', { params });
      setProfiles(response.data.profiles || []);
      setTotalPages(response.data.pagination?.total_pages || 1);
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
  };

  const sendInterest = async (userId) => {
    try {
      await api.post('/interests', { receiver_id: userId });
      toast.success('Interest sent successfully!');
    } catch (error) {
      toast.error(error.response?.data?.errors?.[0] || 'Failed to send interest');
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-8">Search Matches</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Filters</h2>
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      name="min_age"
                      value={filters.min_age}
                      onChange={handleFilterChange}
                      placeholder="Min"
                      className="input-field"
                    />
                    <input
                      type="number"
                      name="max_age"
                      value={filters.max_age}
                      onChange={handleFilterChange}
                      placeholder="Max"
                      className="input-field"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Religion</label>
                  <input
                    type="text"
                    name="religion"
                    value={filters.religion}
                    onChange={handleFilterChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Caste</label>
                  <input
                    type="text"
                    name="caste"
                    value={filters.caste}
                    onChange={handleFilterChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
                  <input
                    type="text"
                    name="education"
                    value={filters.education}
                    onChange={handleFilterChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profession</label>
                  <input
                    type="text"
                    name="profession"
                    value={filters.profession}
                    onChange={handleFilterChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={filters.city}
                    onChange={handleFilterChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    name="state"
                    value={filters.state}
                    onChange={handleFilterChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      name="min_height"
                      value={filters.min_height}
                      onChange={handleFilterChange}
                      placeholder="Min"
                      className="input-field"
                    />
                    <input
                      type="number"
                      name="max_height"
                      value={filters.max_height}
                      onChange={handleFilterChange}
                      placeholder="Max"
                      className="input-field"
                    />
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full">
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilters({
                      min_age: '', max_age: '', religion: '', caste: '',
                      education: '', profession: '', city: '', state: '',
                      min_height: '', max_height: '',
                    });
                  }}
                  className="btn-secondary w-full"
                >
                  Clear Filters
                </button>
              </form>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Searching...</p>
              </div>
            ) : profiles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {profiles.map((profile) => (
                    <div key={profile.id} className="card">
                      <div className="aspect-square bg-gradient-to-br from-pink-200 to-rose-200 rounded-lg mb-4 flex items-center justify-center">
                        {profile.profile_picture_url ? (
                          <img src={profile.profile_picture_url} alt={profile.full_name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <div className="text-6xl text-pink-400">👤</div>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{profile.full_name}</h3>
                      <div className="space-y-1 text-sm text-gray-600 mb-4">
                        <p>{profile.age} years old</p>
                        <p>{profile.height} cm</p>
                        <p>{profile.education}</p>
                        <p>{profile.profession}</p>
                        <p>{profile.city}, {profile.state}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          to={`/profile/${profile.user_id}`}
                          className="btn-secondary flex-1 text-center text-sm"
                        >
                          View Profile
                        </Link>
                        <button
                          onClick={() => sendInterest(profile.user_id)}
                          className="btn-primary flex-1 text-sm"
                        >
                          Send Interest
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="btn-secondary disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="flex items-center px-4">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="btn-secondary disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No profiles found. Try adjusting your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;

