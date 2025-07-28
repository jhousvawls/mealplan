import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the OAuth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setError(error.message);
          // Redirect to login with error
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (data.session) {
          console.log('Authentication successful:', data.session.user.email);
          
          // Get the intended destination from state, or default to dashboard
          const from = location.state?.from?.pathname || '/';
          
          // Redirect to the intended destination
          navigate(from, { replace: true });
        } else {
          // No session found, redirect to login
          navigate('/login', { replace: true });
        }
      } catch (err) {
        console.error('Unexpected error in auth callback:', err);
        setError('An unexpected error occurred');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleAuthCallback();
  }, [navigate, location]);

  if (error) {
    return (
      <div className="min-h-screen bg-background-main flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-background-secondary rounded-2xl p-8 shadow-sm border border-border">
            <div className="w-12 h-12 bg-accent-red/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-accent-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              Authentication Failed
            </h2>
            <p className="text-text-secondary mb-4">
              {error}
            </p>
            <p className="text-sm text-text-secondary">
              Redirecting to login page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-main flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-background-secondary rounded-2xl p-8 shadow-sm border border-border">
          <div className="w-12 h-12 bg-accent-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Completing Sign In
          </h2>
          <p className="text-text-secondary">
            Please wait while we finish setting up your account...
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
