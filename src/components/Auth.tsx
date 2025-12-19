import { useState } from 'react';
import { Eye, EyeOff, Loader2, CheckCircle, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../utils/supabase';

type AuthMode = 'signin' | 'signup';

interface AuthProps {
  onLoginSuccess?: () => void;
}

export function Auth({ onLoginSuccess }: AuthProps = {}) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorBanner, setErrorBanner] = useState('');

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    if (errorBanner) setErrorBanner('');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (mode === 'signup' && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (mode === 'signup') {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
            },
          },
        });

        if (error) throw error;

        toast.success('Account created successfully!', {
          description: 'Welcome to Outfit AI',
          duration: 3000,
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        toast.success('Successfully signed in!', {
          description: 'Welcome back to Outfit AI',
          duration: 3000,
        });
      }

      // Reset form & trigger success
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      if (onLoginSuccess) onLoginSuccess();

    } catch (error: any) {
      console.error('Auth error:', error);
      setErrorBanner(error.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error('Google login failed', { description: error.message });
      setIsLoading(false);
    }
  };

  const handleAppleLogin = () => {
    // Apple login often requires more setup, placeholder for now or similar to Google
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.info('Apple Sign-In', {
        description: 'Requires additional configuration in Supabase dashboard.',
        duration: 3000,
      });
    }, 1000);
  };

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setErrors({});
    setErrorBanner('');
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gray-50 dark:bg-gray-950">
      {/* Centered Card on Web / Full-screen on Mobile */}
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl md:p-8 p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl mb-2">
              {mode === 'signin' ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {mode === 'signin'
                ? 'Sign in to continue to Outfit AI'
                : 'Start generating studio-quality photos'}
            </p>
          </div>

          {/* Toggle */}
          <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg mb-6">
            <button
              onClick={() => mode !== 'signin' && switchMode()}
              className={`flex-1 py-2.5 rounded-md transition-all ${mode === 'signin'
                ? 'bg-white dark:bg-gray-900 shadow-sm'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              Sign in
            </button>
            <button
              onClick={() => mode !== 'signup' && switchMode()}
              className={`flex-1 py-2.5 rounded-md transition-all ${mode === 'signup'
                ? 'bg-white dark:bg-gray-900 shadow-sm'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
            >
              Create account
            </button>
          </div>

          {/* Error Banner */}
          {errorBanner && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-200">{errorBanner}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field (Sign Up Only) */}
            {mode === 'signup' && (
              <div>
                <label htmlFor="name" className="block text-sm mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full pl-11 pr-4 py-3.5 md:py-3 bg-white dark:bg-gray-950 border ${errors.name
                      ? 'border-red-300 dark:border-red-700'
                      : 'border-gray-300 dark:border-gray-700'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-500 transition-all text-base md:text-sm`}
                    placeholder="Enter your full name"
                    disabled={isLoading}
                  />
                </div>
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                )}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-11 pr-4 py-3.5 md:py-3 bg-white dark:bg-gray-950 border ${errors.email
                    ? 'border-red-300 dark:border-red-700'
                    : 'border-gray-300 dark:border-gray-700'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-500 transition-all text-base md:text-sm`}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full pl-11 pr-11 py-3.5 md:py-3 bg-white dark:bg-gray-950 border ${errors.password
                    ? 'border-red-300 dark:border-red-700'
                    : 'border-gray-300 dark:border-gray-700'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-500 transition-all text-base md:text-sm`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field (Sign Up Only) */}
            {mode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full pl-11 pr-11 py-3.5 md:py-3 bg-white dark:bg-gray-950 border ${errors.confirmPassword
                      ? 'border-red-300 dark:border-red-700'
                      : 'border-gray-300 dark:border-gray-700'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-500 transition-all text-base md:text-sm`}
                    placeholder="Confirm your password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Forgot Password (Sign In Only) */}
            {mode === 'signin' && (
              <div className="flex justify-end -mt-2">
                <a href="#forgot" className="text-sm text-purple-600 dark:text-purple-400 hover:underline">
                  Forgot password?
                </a>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 md:py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg'
                }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{mode === 'signin' ? 'Signing in...' : 'Creating account...'}</span>
                </>
              ) : (
                <span>{mode === 'signin' ? 'Sign in' : 'Create account'}</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          {/* Alternative Login Options */}
          <div className="space-y-3">
            {/* Google Login */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className={`w-full py-3.5 md:py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Apple Login */}
            <button
              type="button"
              onClick={handleAppleLogin}
              disabled={isLoading}
              className={`w-full py-3.5 md:py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              <span>Continue with Apple</span>
            </button>
          </div>

          {/* Terms */}
          {mode === 'signup' && (
            <p className="mt-6 text-xs text-center text-gray-500 dark:text-gray-400">
              By creating an account, you agree to our{' '}
              <a href="#terms" className="text-purple-600 dark:text-purple-400 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#privacy" className="text-purple-600 dark:text-purple-400 hover:underline">
                Privacy Policy
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}