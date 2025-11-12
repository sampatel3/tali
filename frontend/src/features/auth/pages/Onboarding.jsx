import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../../shared/services/api';
import toast from 'react-hot-toast';

const Onboarding = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUAEPassLogin = async () => {
    try {
      setLoading(true);
      const { data } = await authAPI.getUAEPassUrl();

      // Store state for verification
      localStorage.setItem('uaepass_state', data.state);

      // Show demo mode message
      if (data.demo) {
        toast.success('🧪 Demo Mode - Logging you in as a test user');
      }

      // Redirect to UAE Pass (or demo callback)
      window.location.href = data.authUrl;
    } catch (error) {
      toast.error('Failed to initiate UAE Pass login');
      setLoading(false);
    }
  };

  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Detection',
      description: 'Automatically detect 100+ UAE subscriptions from your bank statements'
    },
    {
      icon: '💰',
      title: 'Save Money',
      description: 'Track BNPL, meal plans, gyms, and utilities - save AED 500+/month'
    },
    {
      icon: '🎁',
      title: 'Loyalty Rewards',
      description: 'Never miss SHARE, Shukran, Smiles, Skywards points again'
    },
    {
      icon: '📊',
      title: 'Smart Analytics',
      description: 'Get insights on spending patterns and upcoming charges'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-primary-500 to-primary-700 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse-subtle"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-400/20 rounded-full blur-3xl animate-bounce-subtle"></div>
      </div>

      <div className="relative min-h-screen flex flex-col lg:flex-row">
        {/* Left Hero Section */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-16 text-white">
          <div className="max-w-2xl animate-fade-in">
            {/* Logo */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
                <span className="text-4xl font-bold gradient-text">T</span>
              </div>
              <div>
                <h1 className="text-5xl font-bold">TALI</h1>
                <p className="text-2xl opacity-90">تالي</p>
              </div>
            </div>

            {/* Tagline */}
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              The Only App You Need to Manage Your UAE Subscriptions
            </h2>
            <p className="text-xl mb-8 opacity-90 leading-relaxed">
              Track subscriptions, manage bills, maximize loyalty rewards, and save money - all in one beautiful app.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <p className="text-3xl font-bold">100+</p>
                <p className="text-sm opacity-80">UAE Merchants</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">AED 500+</p>
                <p className="text-sm opacity-80">Avg. Savings</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">15+</p>
                <p className="text-sm opacity-80">Banks Supported</p>
              </div>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  <span className="text-3xl mb-2 block">{feature.icon}</span>
                  <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                  <p className="text-sm opacity-80">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Auth Section */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 animate-slide-up">
              {/* Header */}
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome to TALI
                </h3>
                <p className="text-gray-600">
                  Sign in securely with UAE Pass to get started
                </p>
              </div>

              {/* UAE Pass Login Button */}
              <button
                onClick={handleUAEPassLogin}
                disabled={loading}
                className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-3 mb-6"
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 spinner"></div>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl">🇦🇪</span>
                    <span>Sign in with UAE Pass</span>
                  </>
                )}
              </button>

              {/* Demo Mode Alert */}
              <div className="alert alert-info mb-6">
                <div className="flex items-start gap-2">
                  <span className="text-lg">🧪</span>
                  <div>
                    <p className="font-semibold text-sm">Demo Mode Active</p>
                    <p className="text-xs mt-1 opacity-80">
                      Running in test mode. Real UAE Pass credentials not configured yet.
                    </p>
                  </div>
                </div>
              </div>

              {/* Security Info */}
              <div className="text-center text-sm text-gray-500 space-y-2">
                <p className="flex items-center justify-center gap-2">
                  <span>🔒</span>
                  <span>Bank-level security & encryption</span>
                </p>
                <p className="flex items-center justify-center gap-2">
                  <span>✅</span>
                  <span>No passwords stored</span>
                </p>
                <p className="flex items-center justify-center gap-2">
                  <span>🇦🇪</span>
                  <span>UAE Data Residency compliant</span>
                </p>
              </div>

              {/* Divider */}
              <div className="divider"></div>

              {/* Quick Features List */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700 mb-3">What you'll get:</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                    <span>✓</span>
                  </div>
                  <p className="text-sm text-gray-700">Auto-detect all subscriptions</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                    <span>✓</span>
                  </div>
                  <p className="text-sm text-gray-700">Track DEWA, Salik, school fees</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                    <span>✓</span>
                  </div>
                  <p className="text-sm text-gray-700">Manage loyalty programs</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                    <span>✓</span>
                  </div>
                  <p className="text-sm text-gray-700">AI-powered savings insights</p>
                </div>
              </div>
            </div>

            {/* Footer Text */}
            <p className="text-center text-white text-sm mt-6 opacity-80">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
