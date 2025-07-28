import React, { useState, useRef, useEffect } from 'react';
import { signIn, signUp, signOut, resetPassword } from '../lib/supabase';
import { LogIn, LogOut, UserPlus, Mail, ArrowLeft } from 'lucide-react';

interface AuthProps {
  isAuthenticated: boolean;
  onAuthChange: () => void;
}

export const Auth: React.FC<AuthProps> = ({ isAuthenticated, onAuthChange }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isForgotPassword) {
        const { error } = await resetPassword(email);
        if (error) throw error;
        setVerificationSent(true);
        setEmail('');
      } else if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) throw error;
        setVerificationSent(true);
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('email_not_confirmed')) {
            setVerificationSent(true);
            throw new Error('Please check your email and click the confirmation link to verify your account.');
          }
          throw error;
        }
        onAuthChange();
        setEmail('');
        setPassword('');
        setShowForm(false);
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      onAuthChange();
    }
  };

  const resetForm = () => {
    setError(null);
    setVerificationSent(false);
    setIsForgotPassword(false);
    setEmail('');
    setPassword('');
  };

  // Close form when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setShowForm(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isAuthenticated) {
    return (
      <button
        onClick={handleSignOut}
        className="flex items-center px-3 py-1.5 text-sm rounded bg-gray-700 hover:bg-gray-600 transition-colors"
      >
        <LogOut size={16} className="mr-1.5" />
        <span>Sign Out</span>
      </button>
    );
  }

  return (
    <div className="relative" ref={formRef}>
      <button
        onClick={() => {
          setShowForm(!showForm);
          resetForm();
        }}
        className="flex items-center px-3 py-1.5 text-sm rounded bg-gray-700 hover:bg-gray-600 transition-colors"
      >
        {isSignUp ? (
          <>
            <UserPlus size={16} className="mr-1.5" />
            <span>Sign Up</span>
          </>
        ) : (
          <>
            <LogIn size={16} className="mr-1.5" />
            <span>Sign In</span>
          </>
        )}
      </button>

      {showForm && (
        <div className="absolute right-0 top-full mt-2 p-4 bg-gray-800 rounded-lg shadow-lg w-80 z-50 border border-gray-700">
          {verificationSent ? (
            <div className="text-center py-4">
              <Mail className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Check your email</h3>
              <p className="text-gray-400 text-sm mb-4">
                We've sent a {isForgotPassword ? 'password reset' : 'verification'} link to <strong>{email}</strong>.
              </p>
              <button
                onClick={() => {
                  resetForm();
                  setIsSignUp(false);
                }}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Return to sign in
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 p-2 bg-red-900/50 border border-red-500 rounded text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                {isForgotPassword && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setError(null);
                    }}
                    className="flex items-center text-sm text-gray-400 hover:text-white mb-2"
                  >
                    <ArrowLeft size={16} className="mr-1" />
                    Back to sign in
                  </button>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                
                {!isForgotPassword && (
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors disabled:opacity-50"
                >
                  {loading ? 'Processing...' : isForgotPassword ? 'Reset Password' : isSignUp ? 'Create Account' : 'Sign In'}
                </button>

                {!isForgotPassword && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError(null);
                    }}
                    className="w-full text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
                  </button>
                )}

                {!isSignUp && !isForgotPassword && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setError(null);
                    }}
                    className="w-full text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Forgot your password?
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};