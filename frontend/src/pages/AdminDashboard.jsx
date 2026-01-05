import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/users')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
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
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card bg-gradient-to-br from-pink-500 to-rose-500 text-white">
              <h3 className="text-sm font-medium opacity-90 mb-1">Total Users</h3>
              <p className="text-3xl font-bold">{stats.total_users || 0}</p>
            </div>
            <div className="card bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
              <h3 className="text-sm font-medium opacity-90 mb-1">Active Subscriptions</h3>
              <p className="text-3xl font-bold">{stats.active_subscriptions || 0}</p>
            </div>
            <div className="card bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
              <h3 className="text-sm font-medium opacity-90 mb-1">Total Profiles</h3>
              <p className="text-3xl font-bold">{stats.total_profiles || 0}</p>
            </div>
            <div className="card bg-gradient-to-br from-green-500 to-emerald-500 text-white">
              <h3 className="text-sm font-medium opacity-90 mb-1">Pending Interests</h3>
              <p className="text-3xl font-bold">{stats.pending_interests || 0}</p>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="card">
          <h2 className="text-2xl font-semibold mb-4">Users</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscriptions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {user.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.profile ? 'Yes' : 'No'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.subscriptions?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

