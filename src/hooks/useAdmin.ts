/**
 * useAdmin Hook
 * 
 * Provides admin functionality for managing users, subscriptions, and system settings.
 * Only accessible to users with is_admin = true.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabase';

export interface AdminUser {
    user_id: string;
    email: string;
    full_name: string | null;
    plan_tier: string;
    credits_total: number;
    credits_used: number;
    credits_remaining: number;
    renewal_date: string | null;
    is_admin: boolean;
    is_blocked: boolean;
    created_at: string;
    updated_at: string;
}

export interface SystemSetting {
    id: string;
    key: string;
    value: string;
    description: string | null;
    updated_at: string;
}

export interface AdminStats {
    totalUsers: number;
    proUsers: number;
    freeUsers: number;
    blockedUsers: number;
    totalGenerations: number;
}

export function useAdmin() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [settings, setSettings] = useState<SystemSetting[]>([]);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Check if current user is admin
    const checkAdminStatus = useCallback(async () => {
        if (!isSupabaseConfigured) {
            setIsLoading(false);
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setIsLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('user_credits')
                .select('is_admin')
                .eq('user_id', user.id)
                .single();

            if (error) throw error;

            setIsAdmin(data?.is_admin || false);
        } catch (err) {
            console.error('Error checking admin status:', err);
            setIsAdmin(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch all users (admin only)
    const fetchUsers = useCallback(async () => {
        if (!isAdmin) return;

        try {
            const { data, error } = await supabase
                .from('admin_user_view')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);

            // Calculate stats
            const totalUsers = data?.length || 0;
            const proUsers = data?.filter(u => u.plan_tier === 'pro').length || 0;
            const freeUsers = data?.filter(u => u.plan_tier === 'free').length || 0;
            const blockedUsers = data?.filter(u => u.is_blocked).length || 0;
            const totalGenerations = data?.reduce((sum, u) => sum + (u.credits_used || 0), 0) || 0;

            setStats({
                totalUsers,
                proUsers,
                freeUsers,
                blockedUsers,
                totalGenerations,
            });
        } catch (err: any) {
            console.error('Error fetching users:', err);
            setError(err.message);
        }
    }, [isAdmin]);

    // Fetch system settings
    const fetchSettings = useCallback(async () => {
        if (!isAdmin) return;

        try {
            const { data, error } = await supabase
                .from('system_settings')
                .select('*')
                .order('key');

            if (error) throw error;
            setSettings(data || []);
        } catch (err: any) {
            console.error('Error fetching settings:', err);
            setError(err.message);
        }
    }, [isAdmin]);

    // Block/Unblock user
    const toggleUserBlock = useCallback(async (userId: string, blocked: boolean): Promise<boolean> => {
        if (!isAdmin) return false;

        try {
            const { error } = await supabase
                .from('user_credits')
                .update({ is_blocked: blocked, updated_at: new Date().toISOString() })
                .eq('user_id', userId);

            if (error) throw error;
            await fetchUsers();
            return true;
        } catch (err) {
            console.error('Error toggling user block:', err);
            return false;
        }
    }, [isAdmin, fetchUsers]);

    // Update user credits
    const updateUserCredits = useCallback(async (
        userId: string,
        creditsTotal: number,
        creditsUsed?: number
    ): Promise<boolean> => {
        if (!isAdmin) return false;

        try {
            const update: any = {
                credits_total: creditsTotal,
                updated_at: new Date().toISOString()
            };

            if (creditsUsed !== undefined) {
                update.credits_used = creditsUsed;
            }

            const { error } = await supabase
                .from('user_credits')
                .update(update)
                .eq('user_id', userId);

            if (error) throw error;
            await fetchUsers();
            return true;
        } catch (err) {
            console.error('Error updating user credits:', err);
            return false;
        }
    }, [isAdmin, fetchUsers]);

    // Reset user usage
    const resetUserUsage = useCallback(async (userId: string): Promise<boolean> => {
        if (!isAdmin) return false;

        try {
            const { error } = await supabase
                .from('user_credits')
                .update({ credits_used: 0, updated_at: new Date().toISOString() })
                .eq('user_id', userId);

            if (error) throw error;
            await fetchUsers();
            return true;
        } catch (err) {
            console.error('Error resetting user usage:', err);
            return false;
        }
    }, [isAdmin, fetchUsers]);

    // Extend subscription
    const extendSubscription = useCallback(async (
        userId: string,
        days: number
    ): Promise<boolean> => {
        if (!isAdmin) return false;

        try {
            // Get current renewal date or use now
            const { data: userData } = await supabase
                .from('user_credits')
                .select('renewal_date')
                .eq('user_id', userId)
                .single();

            const baseDate = userData?.renewal_date
                ? new Date(userData.renewal_date)
                : new Date();

            baseDate.setDate(baseDate.getDate() + days);

            const { error } = await supabase
                .from('user_credits')
                .update({
                    renewal_date: baseDate.toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId);

            if (error) throw error;
            await fetchUsers();
            return true;
        } catch (err) {
            console.error('Error extending subscription:', err);
            return false;
        }
    }, [isAdmin, fetchUsers]);

    // Update system setting
    const updateSetting = useCallback(async (
        key: string,
        value: string
    ): Promise<boolean> => {
        if (!isAdmin) return false;

        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { error } = await supabase
                .from('system_settings')
                .update({
                    value,
                    updated_at: new Date().toISOString(),
                    updated_by: user?.id
                })
                .eq('key', key);

            if (error) throw error;
            await fetchSettings();
            return true;
        } catch (err) {
            console.error('Error updating setting:', err);
            return false;
        }
    }, [isAdmin, fetchSettings]);

    // Get a specific setting value
    const getSetting = useCallback((key: string): string | null => {
        const setting = settings.find(s => s.key === key);
        return setting?.value || null;
    }, [settings]);

    // Check if generations are enabled
    const isGenerationEnabled = getSetting('generation_enabled') === 'true';

    // Initialize
    useEffect(() => {
        checkAdminStatus();
    }, [checkAdminStatus]);

    // Fetch data when admin status confirmed
    useEffect(() => {
        if (isAdmin) {
            fetchUsers();
            fetchSettings();
        }
    }, [isAdmin, fetchUsers, fetchSettings]);

    return {
        isAdmin,
        isLoading,
        users,
        settings,
        stats,
        error,
        isGenerationEnabled,
        getSetting,
        toggleUserBlock,
        updateUserCredits,
        resetUserUsage,
        extendSubscription,
        updateSetting,
        refetch: () => {
            fetchUsers();
            fetchSettings();
        },
    };
}
