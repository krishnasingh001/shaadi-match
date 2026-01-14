import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <span className="text-3xl font-serif font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                ShaadiMatch
              </span>
            </Link>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link to="/dashboard" className="text-gray-700 hover:text-pink-600 px-3 py-2">
                    Dashboard
                  </Link>
                  <Link to="/profile" className="text-gray-700 hover:text-pink-600 px-3 py-2">
                    My Profile
                  </Link>
                  <Link to="/search" className="text-gray-700 hover:text-pink-600 px-3 py-2">
                    Discover Profiles
                  </Link>
                  <Link to="/favorites" className="text-gray-700 hover:text-pink-600 px-3 py-2">
                    Favorites
                  </Link>
                  <Link to="/messages" className="text-gray-700 hover:text-pink-600 px-3 py-2">
                    Messages
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="btn-secondary text-sm"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-pink-600 px-3 py-2">
                    Login
                  </Link>
                  <Link to="/signup" className="btn-primary text-sm">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <main>{children}</main>
      
      <footer className="bg-gradient-to-r from-pink-500 to-rose-500 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-serif font-bold mb-4">ShaadiMatch</h3>
              <p className="text-pink-100">
                Find your perfect life partner with our trusted matchmaking platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-pink-100">
                <li><Link to="/search" className="hover:text-white">Discover Profiles</Link></li>
                <li><Link to="/subscriptions" className="hover:text-white">Subscriptions</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-pink-100">Email: support@shaadimatch.com</p>
              <p className="text-pink-100">Phone: +91 1800-XXX-XXXX</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-pink-400 text-center text-pink-100">
            <p>&copy; 2024 ShaadiMatch. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

