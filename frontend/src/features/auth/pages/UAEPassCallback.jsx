import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../../../shared/services/api';
import { useAuthStore } from '../../../shared/store/authStore';
import toast from 'react-hot-toast';

const UAEPassCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const storedState = localStorage.getItem('uaepass_state');

        if (!code) {
          throw new Error('No authorization code received');
        }

        // Verify state (CSRF protection)
        if (state !== storedState) {
          throw new Error('Invalid state parameter');
        }

        // Exchange code for tokens
        const { data } = await authAPI.uaePassCallback(code, state);

        if (data.success) {
          setAuth(data.user, data.accessToken, data.refreshToken);
          localStorage.removeItem('uaepass_state');
          toast.success('Welcome to TALI!');
          navigate('/dashboard');
        } else {
          throw new Error('Authentication failed');
        }
      } catch (err) {
        console.error('UAE Pass callback error:', err);
        setError(err.message);
        toast.error('Authentication failed. Please try again.');
        setTimeout(() => navigate('/onboarding'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, setAuth]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">Completing authentication...</h2>
      </div>
    </div>
  );
};

export default UAEPassCallback;
