import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

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
            <Link to="/" className="flex items-center gap-3 group">
              {/* 2-Color Heart Logo */}
              <div className="w-10 h-10 flex-shrink-0">
                <svg className="w-full h-full drop-shadow-lg group-hover:scale-110 transition-transform duration-300" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="navHeartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ec4899" />
                      <stop offset="100%" stopColor="#f43f5e" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M50 85 L20 55 C10 45 10 30 20 20 C30 10 45 10 50 20 C55 10 70 10 80 20 C90 30 90 45 80 55 Z"
                    fill="url(#navHeartGradient)"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <path
                    d="M50 75 L30 55 C25 50 25 40 30 35 C35 30 45 30 50 35 C55 30 65 30 70 35 C75 40 75 50 70 55 Z"
                    fill="white"
                    opacity="0.3"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  PairPerfectly
                </span>
                <span className="text-xs font-medium text-gray-500 italic -mt-1 hidden sm:block">
                  Dating with intent. Marriage by choice.
                </span>
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link to="/dashboard" className="text-gray-700 hover:text-pink-600 px-3 py-2 transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/profile" className="text-gray-700 hover:text-pink-600 px-3 py-2 transition-colors">
                    My Profile
                  </Link>
                  <Link to="/search" className="text-gray-700 hover:text-pink-600 px-3 py-2 transition-colors">
                    Discover Profiles
                  </Link>
                  <Link to="/favorites" className="text-gray-700 hover:text-pink-600 px-3 py-2 transition-colors">
                    Favorites
                  </Link>
                  <Link to="/messages" className="text-gray-700 hover:text-pink-600 px-3 py-2 transition-colors">
                    Messages
                  </Link>
                  {/* Notification Bell */}
                  <NotificationBell />
                  <button
                    onClick={handleLogout}
                    className="btn-secondary text-sm"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-pink-600 px-3 py-2 transition-colors">
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
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10">
                  <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="footerHeartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#f43f5e" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M50 85 L20 55 C10 45 10 30 20 20 C30 10 45 10 50 20 C55 10 70 10 80 20 C90 30 90 45 80 55 Z"
                      fill="url(#footerHeartGradient)"
                    />
                    <path
                      d="M50 75 L30 55 C25 50 25 40 30 35 C35 30 45 30 50 35 C55 30 65 30 70 35 C75 40 75 50 70 55 Z"
                      fill="white"
                      opacity="0.3"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">PairPerfectly</h3>
              </div>
              <p className="text-lg font-semibold text-white mb-3 italic">
                Dating with intent. Marriage by choice.
              </p>
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
              <p className="text-pink-100">Email: support@pairperfectly.com</p>
              <p className="text-pink-100">Phone: +91 1800-XXX-XXXX</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-pink-400 text-center text-pink-100">
            <p>&copy; 2024 PairPerfectly. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

