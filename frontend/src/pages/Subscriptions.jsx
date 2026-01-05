import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 999,
      duration: '1 month',
      features: [
        'View 50 profiles per day',
        'Send 10 interests per day',
        'Basic search filters',
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 2499,
      duration: '3 months',
      features: [
        'Unlimited profile views',
        'Unlimited interests',
        'Advanced search filters',
        'Priority customer support',
        'See who viewed your profile',
      ],
      popular: true,
    },
    {
      id: 'platinum',
      name: 'Platinum',
      price: 4999,
      duration: '6 months',
      features: [
        'Everything in Premium',
        'Featured profile listing',
        'Verified badge',
        'Direct contact details',
        'Personal matchmaking assistance',
      ],
    },
  ];

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get('/subscriptions');
      setSubscriptions(response.data || []);
    } catch (error) {
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const subscribe = async (planType) => {
    try {
      await api.post('/subscriptions', {
        subscription: { plan_type: planType }
      });
      toast.success('Subscription activated successfully!');
      fetchSubscriptions();
    } catch (error) {
      toast.error(error.response?.data?.errors?.[0] || 'Failed to subscribe');
    }
  };

  const hasActiveSubscription = subscriptions.some(sub => sub.status === 'active' && new Date(sub.end_date) >= new Date());

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600">
            Unlock premium features to find your perfect match faster
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`card relative ${plan.popular ? 'ring-2 ring-pink-500 transform scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-pink-500 text-white px-4 py-1 rounded-bl-lg rounded-tr-xl text-sm font-semibold">
                  Popular
                </div>
              )}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-pink-600">₹{plan.price}</span>
                  <span className="text-gray-600">/{plan.duration}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-pink-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => subscribe(plan.id)}
                disabled={hasActiveSubscription}
                className={`w-full ${plan.popular ? 'btn-primary' : 'btn-secondary'} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {hasActiveSubscription ? 'Already Subscribed' : 'Subscribe Now'}
              </button>
            </div>
          ))}
        </div>

        {/* Current Subscriptions */}
        {subscriptions.length > 0 && (
          <div className="card">
            <h2 className="text-2xl font-semibold mb-4">Your Subscriptions</h2>
            <div className="space-y-4">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="border-b pb-4 last:border-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-lg capitalize">{sub.plan_type}</h3>
                      <p className="text-gray-600">
                        {new Date(sub.start_date).toLocaleDateString()} - {new Date(sub.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-4 py-2 rounded-lg font-semibold ${
                      sub.status === 'active' && new Date(sub.end_date) >= new Date()
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {sub.status === 'active' && new Date(sub.end_date) >= new Date() ? 'Active' : 'Expired'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscriptions;

