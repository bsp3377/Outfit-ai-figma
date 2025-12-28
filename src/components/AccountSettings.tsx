import { useState, useEffect } from 'react';
import { User, Mail, Lock, Moon, Sun, Globe, LogOut, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { supabase } from '../utils/supabase';
import { UserReviewForm } from './UserReviewForm';

interface AccountSettingsProps {
  isDark: boolean;
  onToggleDark: () => void;
  onLogout: () => void;
}

export function AccountSettings({ isDark, onToggleDark, onLogout }: AccountSettingsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) throw error;

        if (user) {
          setFormData(prev => ({
            ...prev,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
            email: user.email || '',
          }));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: formData.name }
      });

      if (error) throw error;
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error('Failed to update profile', { description: error.message });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (error) throw error;
      toast.success('Password changed successfully!');
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error('Failed to change password', { description: error.message });
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl sm:text-3xl mb-6">Account Settings</h1>

      {/* Profile Settings */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h2 className="text-xl">Profile Information</h2>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
          >
            Save Changes
          </button>
        </form>
      </div>

      {/* Password Change */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h2 className="text-xl">Change Password</h2>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Current Password</label>
            <input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">New Password</label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">Confirm New Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              placeholder="Confirm new password"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
          >
            Update Password
          </button>
        </form>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          {isDark ? (
            <Moon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          ) : (
            <Sun className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          )}
          <h2 className="text-xl">Appearance</h2>
        </div>

        <div className="flex items-start justify-between py-3">
          <div className="flex-1">
            <p className="mb-1">Dark Mode</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Use dark theme across the application
            </p>
          </div>
          <button
            onClick={onToggleDark}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDark ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-700'
              }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDark ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
          </button>
        </div>
      </div>

      {/* User Review */}
      <UserReviewForm />

      {/* Danger Zone */}
      <div className="bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900/50 rounded-xl p-6">
        <h2 className="text-xl text-red-600 dark:text-red-400 mb-6">Danger Zone</h2>

        <div className="space-y-4">
          <div className="flex items-start justify-between py-3 border-b border-gray-200 dark:border-gray-800">
            <div className="flex-1">
              <p className="mb-1">Logout</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sign out from your account
              </p>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all text-sm flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          <div className="flex items-start justify-between py-3">
            <div className="flex-1">
              <p className="mb-1">Delete Account</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Permanently delete your account and all data
              </p>
            </div>
            <button
              onClick={() => toast.error('Account deletion is disabled in demo')}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all text-sm"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}