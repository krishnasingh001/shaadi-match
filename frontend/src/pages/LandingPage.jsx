import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-6">
              Find Your
              <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">
                Perfect Match
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of happy couples who found their life partner through our trusted matchmaking platform.
            </p>
            {!user && (
              <div className="flex justify-center space-x-4">
                <Link to="/signup" className="btn-primary text-lg px-8 py-4">
                  Get Started Free
                </Link>
                <Link to="/login" className="btn-secondary text-lg px-8 py-4">
                  Sign In
                </Link>
              </div>
            )}
            {user && (
              <Link to="/dashboard" className="btn-primary text-lg px-8 py-4 inline-block">
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-serif font-bold text-center text-gray-900 mb-12">
            Why Choose ShaadiMatch?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Matching</h3>
              <p className="text-gray-600">
                Our advanced algorithm finds compatible matches based on your preferences and values.
              </p>
            </div>
            
            <div className="card text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-gray-600">
                Your data is protected with industry-leading security measures and privacy controls.
              </p>
            </div>
            
            <div className="card text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Profiles</h3>
              <p className="text-gray-600">
                All profiles are verified to ensure authenticity and build trust in our community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-serif font-bold text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of members and find your perfect match today.
          </p>
          {!user && (
            <Link to="/signup" className="bg-white text-indigo-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-indigo-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 inline-block">
              Create Free Account
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

