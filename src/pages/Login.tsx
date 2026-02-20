import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Gamepad2 } from 'lucide-react';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import { useAuth } from '@/contexts/AuthContext';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // Get redirect URL from query params
  const redirectUrl = searchParams.get('redirect');
  const tabParam = searchParams.get('tab');
  
  // Build the full redirect path
  const getRedirectPath = () => {
    if (redirectUrl) {
      // If there's a tab parameter, append it to the redirect URL
      if (tabParam) {
        const hasQueryParams = redirectUrl.includes('?');
        return `${redirectUrl}${hasQueryParams ? '&' : '?'}tab=${tabParam}`;
      }
      return redirectUrl;
    }
    return '/profile';
  };

  useEffect(() => {
    if (user) {
      navigate(getRedirectPath());
    }
  }, [user, navigate, redirectUrl, tabParam]);

  const handleLoginSuccess = () => {
    navigate(getRedirectPath());
  };

  const handleSignupSuccess = () => {
    navigate(getRedirectPath());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
      </div>
      
      <div className="relative w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-amber-500 rounded-xl">
              <Gamepad2 className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-black text-gray-900 dark:text-white">
              Shitty Games
            </span>
          </div>
          
          <h1 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </h1>
          <p className="text-center text-gray-500 mb-6">
            {isLogin ? 'Sign in to play games and track your stats' : 'Sign up to join the fun'}
          </p>
          
          {/* Show redirect info if coming from subscription */}
          {tabParam === 'subscription' && (
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 mb-6 text-center">
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Sign in to manage your subscription
              </p>
            </div>
          )}
          
          {isLogin ? (
            <LoginForm onToggle={() => setIsLogin(false)} onSuccess={handleLoginSuccess} />
          ) : (
            <SignupForm onToggle={() => setIsLogin(true)} onSuccess={handleSignupSuccess} />
          )}
        </div>
        
        <p className="text-center text-gray-400 text-sm mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default Login;
