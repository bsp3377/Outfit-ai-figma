/**
 * Admin Dashboard Component
 * 
 * Provides admin controls for managing users, subscriptions, and system settings.
 * Only accessible to users with is_admin = true.
 */

import { useState } from 'react';
import {
    Users, Settings, Shield, AlertTriangle, RefreshCw,
    Ban, Check, Search, ChevronDown, Zap, Clock, CreditCard
} from 'lucide-react';
import { toast } from 'sonner';
import { useAdmin, AdminUser } from '../hooks/useAdmin';

export function AdminDashboard() {
    const {
        isAdmin,
        isLoading,
        users,
        settings,
        stats,
        error,
        isGenerationEnabled,
        toggleUserBlock,
        updateUserCredits,
        resetUserUsage,
        extendSubscription,
        updateSetting,
        refetch,
    } = useAdmin();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [extendDays, setExtendDays] = useState(30);
    const [addCredits, setAddCredits] = useState(50);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <Shield className="w-16 h-16 text-red-500" />
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    You don't have permission to access the admin dashboard.
                </p>
            </div>
        );
    }

    const filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleToggleGeneration = async () => {
        const newValue = isGenerationEnabled ? 'false' : 'true';
        const success = await updateSetting('generation_enabled', newValue);
        if (success) {
            toast.success(`Generation ${newValue === 'true' ? 'enabled' : 'disabled'}`);
        } else {
            toast.error('Failed to update setting');
        }
    };

    const handleBlockUser = async (user: AdminUser) => {
        const success = await toggleUserBlock(user.user_id, !user.is_blocked);
        if (success) {
            toast.success(`User ${user.is_blocked ? 'unblocked' : 'blocked'}`);
        } else {
            toast.error('Failed to update user');
        }
    };

    const handleResetUsage = async (user: AdminUser) => {
        const success = await resetUserUsage(user.user_id);
        if (success) {
            toast.success('Usage reset successfully');
        } else {
            toast.error('Failed to reset usage');
        }
    };

    const handleExtendSubscription = async () => {
        if (!selectedUser) return;
        const success = await extendSubscription(selectedUser.user_id, extendDays);
        if (success) {
            toast.success(`Subscription extended by ${extendDays} days`);
            setShowUserModal(false);
        } else {
            toast.error('Failed to extend subscription');
        }
    };

    const handleAddCredits = async () => {
        if (!selectedUser) return;
        const newTotal = selectedUser.credits_total + addCredits;
        const success = await updateUserCredits(selectedUser.user_id, newTotal);
        if (success) {
            toast.success(`Added ${addCredits} credits`);
            setShowUserModal(false);
        } else {
            toast.error('Failed to add credits');
        }
    };

    return (
        <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                        <Shield className="w-8 h-8 text-purple-600" />
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Manage users, subscriptions, and system settings
                    </p>
                </div>
                <button
                    onClick={refetch}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                            <Users className="w-4 h-4" />
                            <span className="text-sm">Total Users</span>
                        </div>
                        <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                            <CreditCard className="w-4 h-4" />
                            <span className="text-sm">Pro Users</span>
                        </div>
                        <div className="text-2xl font-bold text-purple-600">{stats.proUsers}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                            <Users className="w-4 h-4" />
                            <span className="text-sm">Free Users</span>
                        </div>
                        <div className="text-2xl font-bold">{stats.freeUsers}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-1">
                            <Ban className="w-4 h-4" />
                            <span className="text-sm">Blocked</span>
                        </div>
                        <div className="text-2xl font-bold text-red-600">{stats.blockedUsers}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
                            <Zap className="w-4 h-4" />
                            <span className="text-sm">Generations</span>
                        </div>
                        <div className="text-2xl font-bold text-green-600">{stats.totalGenerations}</div>
                    </div>
                </div>
            )}

            {/* Emergency Switch */}
            <div className={`p-4 rounded-xl border-2 ${isGenerationEnabled
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-900/30'
                    : 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30'
                }`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className={`w-6 h-6 ${isGenerationEnabled ? 'text-green-600' : 'text-red-600'}`} />
                        <div>
                            <h3 className="font-semibold">Generation Status</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {isGenerationEnabled
                                    ? 'AI generation is currently enabled for all users'
                                    : 'AI generation is DISABLED - users cannot generate images'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleToggleGeneration}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${isGenerationEnabled
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                    >
                        {isGenerationEnabled ? 'Disable Generation' : 'Enable Generation'}
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credits</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {filteredUsers.map(user => (
                                <tr key={user.user_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-4 py-3">
                                        <div>
                                            <div className="font-medium">{user.full_name || 'N/A'}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.plan_tier === 'pro'
                                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                            }`}>
                                            {user.plan_tier?.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-sm">
                                            <span className="font-medium">{user.credits_remaining}</span>
                                            <span className="text-gray-500"> / {user.credits_total}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {user.is_blocked ? (
                                            <span className="flex items-center gap-1 text-red-600">
                                                <Ban className="w-4 h-4" /> Blocked
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-green-600">
                                                <Check className="w-4 h-4" /> Active
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleBlockUser(user)}
                                                className={`p-2 rounded-lg transition-colors ${user.is_blocked
                                                        ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20'
                                                        : 'text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20'
                                                    }`}
                                                title={user.is_blocked ? 'Unblock' : 'Block'}
                                            >
                                                {user.is_blocked ? <Check className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => handleResetUsage(user)}
                                                className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                                title="Reset Usage"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => { setSelectedUser(user); setShowUserModal(true); }}
                                                className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                                                title="Manage"
                                            >
                                                <Settings className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* User Management Modal */}
            {showUserModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold mb-4">Manage User</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">{selectedUser.email}</p>

                        <div className="space-y-6">
                            {/* Extend Subscription */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Extend Subscription</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={extendDays}
                                        onChange={(e) => setExtendDays(Number(e.target.value))}
                                        className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
                                        min="1"
                                    />
                                    <button
                                        onClick={handleExtendSubscription}
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
                                    >
                                        <Clock className="w-4 h-4" />
                                        Extend
                                    </button>
                                </div>
                            </div>

                            {/* Add Credits */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Add Credits</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={addCredits}
                                        onChange={(e) => setAddCredits(Number(e.target.value))}
                                        className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
                                        min="1"
                                    />
                                    <button
                                        onClick={handleAddCredits}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
                                    >
                                        <Zap className="w-4 h-4" />
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setShowUserModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
