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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">TALI</h1>
          <p className="text-2xl text-primary-500 mb-4">تالي</p>
          <p className="text-gray-600">
            Track subscriptions & manage loyalty programs across UAE & GCC
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleUAEPassLogin}
            disabled={loading}
            className="w-full btn-primary py-3 text-lg flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Loading...</span>
            ) : (
              <>
                <span>🇦🇪</span>
                <span>Sign in with UAE Pass</span>
              </>
            )}
          </button>

          <div className="text-center text-sm text-gray-500 mt-6">
            <p>Secure authentication via UAE Pass</p>
            <p className="mt-2">No passwords. No hassle.</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <p className="text-xs text-blue-800 text-center">
              🧪 <strong>Demo Mode:</strong> This is running in demo mode for testing. 
              Real UAE Pass credentials not configured.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Features:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center">
              <span className="mr-2">✅</span>
              Auto-detect subscriptions from bank accounts
            </li>
            <li className="flex items-center">
              <span className="mr-2">✅</span>
              Track SHARE, Shukran, Smiles & more
            </li>
            <li className="flex items-center">
              <span className="mr-2">✅</span>
              Never miss a renewal date
            </li>
            <li className="flex items-center">
              <span className="mr-2">✅</span>
              Maximize your loyalty rewards
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
