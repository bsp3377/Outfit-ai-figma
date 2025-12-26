/**
 * useCredits Hook
 * 
 * Manages user credits for image generation.
 * Fetches and updates credits from Supabase user_credits table.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabase';

export type PlanTier = 'free' | 'pro' | 'corporate';

export interface UserCredits {
    user_id: string;
    plan_tier: PlanTier;
    credits_total: number;
    credits_used: number;
    renewal_date: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreditsState {
    planTier: PlanTier;
    creditsTotal: number;
    creditsUsed: number;
    creditsRemaining: number;
    renewalDate: Date | null;
    isLoading: boolean;
    error: string | null;
}

export function useCredits() {
    const [credits, setCredits] = useState<CreditsState>({
        planTier: 'free',
        creditsTotal: 10,
        creditsUsed: 0,
        creditsRemaining: 10,
        renewalDate: null,
        isLoading: true,
        error: null,
    });

    const [userId, setUserId] = useState<string | null>(null);

    // Track when this hook instance is doing an update to avoid refetch race condition
    const isUpdatingRef = useRef(false);

    // Fetch user credits from Supabase
    const fetchCredits = useCallback(async () => {
        if (!isSupabaseConfigured) {
            setCredits(prev => ({ ...prev, isLoading: false }));
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setCredits(prev => ({ ...prev, isLoading: false }));
                return;
            }

            setUserId(user.id);

            const { data, error } = await supabase
                .from('user_credits')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error) {
                // If no row exists, create one with free tier defaults
                if (error.code === 'PGRST116') {
                    const { data: newData, error: insertError } = await supabase
                        .from('user_credits')
                        .insert({
                            user_id: user.id,
                            plan_tier: 'free',
                            credits_total: 10,
                            credits_used: 0,
                        })
                        .select()
                        .single();

                    if (insertError) throw insertError;

                    setCredits({
                        planTier: 'free',
                        creditsTotal: 10,
                        creditsUsed: 0,
                        creditsRemaining: 10,
                        renewalDate: null,
                        isLoading: false,
                        error: null,
                    });
                    return;
                }
                throw error;
            }

            if (data) {
                const userCredits = data as UserCredits;
                const total = userCredits.credits_total ?? 10;
                const used = userCredits.credits_used ?? 0;
                setCredits({
                    planTier: userCredits.plan_tier || 'free',
                    creditsTotal: total,
                    creditsUsed: used,
                    creditsRemaining: total - used,
                    renewalDate: userCredits.renewal_date ? new Date(userCredits.renewal_date) : null,
                    isLoading: false,
                    error: null,
                });
            }
        } catch (err) {
            console.error('Error fetching credits:', err);
            setCredits(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to load credits',
            }));
        }
    }, []);

    // Use one credit (for generation)
    const useCredit = useCallback(async (): Promise<boolean> => {
        if (!userId || !isSupabaseConfigured) {
            return false;
        }

        // Check if credits available
        if (credits.creditsRemaining <= 0) {
            return false;
        }

        try {
            const newCreditsUsed = credits.creditsUsed + 1;

            const { error } = await supabase
                .from('user_credits')
                .update({
                    credits_used: newCreditsUsed,
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', userId);

            if (error) throw error;

            // Update local state
            setCredits(prev => ({
                ...prev,
                creditsUsed: newCreditsUsed,
                creditsRemaining: prev.creditsTotal - newCreditsUsed,
            }));

            // Set flag to skip refetch for this instance, then dispatch event
            isUpdatingRef.current = true;
            window.dispatchEvent(new Event('credits-updated'));
            // Clear flag after a short delay
            setTimeout(() => { isUpdatingRef.current = false; }, 500);

            return true;
        } catch (err) {
            console.error('Error using credit:', err);
            return false;
        }
    }, [userId, credits.creditsUsed, credits.creditsRemaining]);

    // Add credits (after purchase)
    const addCredits = useCallback(async (amount: number): Promise<boolean> => {
        if (!userId || !isSupabaseConfigured) {
            return false;
        }

        try {
            const newCreditsTotal = credits.creditsTotal + amount;

            const { error } = await supabase
                .from('user_credits')
                .update({
                    credits_total: newCreditsTotal,
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', userId);

            if (error) throw error;

            // Update local state
            setCredits(prev => ({
                ...prev,
                creditsTotal: newCreditsTotal,
                creditsRemaining: newCreditsTotal - prev.creditsUsed,
            }));

            // Set flag to skip refetch for this instance, then dispatch event
            isUpdatingRef.current = true;
            window.dispatchEvent(new Event('credits-updated'));
            setTimeout(() => { isUpdatingRef.current = false; }, 500);

            return true;
        } catch (err) {
            console.error('Error adding credits:', err);
            return false;
        }
    }, [userId, credits.creditsTotal]);

    // Upgrade to Pro plan
    const upgradeToPro = useCallback(async (): Promise<boolean> => {
        if (!userId || !isSupabaseConfigured) {
            return false;
        }

        try {
            const renewalDate = new Date();
            renewalDate.setMonth(renewalDate.getMonth() + 1);

            const { error } = await supabase
                .from('user_credits')
                .update({
                    plan_tier: 'pro',
                    credits_total: 100,
                    credits_used: 0,
                    renewal_date: renewalDate.toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', userId);

            if (error) throw error;

            // Update local state
            setCredits({
                planTier: 'pro',
                creditsTotal: 100,
                creditsUsed: 0,
                creditsRemaining: 100,
                renewalDate,
                isLoading: false,
                error: null,
            });

            return true;
        } catch (err) {
            console.error('Error upgrading to Pro:', err);
            return false;
        }
    }, [userId]);

    // Log transaction in database
    const logTransaction = useCallback(async (
        transactionType: 'subscription' | 'credit_pack' | 'promo_code' | 'refund',
        amountDisplay: string,
        creditsAdded: number,
        description: string
    ): Promise<boolean> => {
        if (!userId || !isSupabaseConfigured) {
            return false;
        }

        try {
            const { error } = await supabase
                .from('user_transactions')
                .insert({
                    user_id: userId,
                    transaction_type: transactionType,
                    amount_display: amountDisplay,
                    credits_added: creditsAdded,
                    description,
                });

            if (error) throw error;
            return true;
        } catch (err) {
            console.error('Error logging transaction:', err);
            return false;
        }
    }, [userId]);

    // Redeem a promo code
    const redeemPromoCode = useCallback(async (code: string): Promise<{ success: boolean; message: string; credits?: number }> => {
        console.log('🎟️ redeemPromoCode called with:', code, 'userId:', userId);
        if (!userId || !isSupabaseConfigured) {
            console.log('❌ No userId or Supabase not configured');
            return { success: false, message: 'Please sign in to redeem a code' };
        }

        const trimmedCode = code.trim().toUpperCase();
        if (!trimmedCode) {
            return { success: false, message: 'Please enter a promo code' };
        }

        try {
            // Get current user's email
            const { data: { user } } = await supabase.auth.getUser();
            const userEmail = user?.email?.toLowerCase();
            console.log('👤 User email:', userEmail);

            // Check if code exists
            console.log('🔍 Checking code in database:', trimmedCode);
            const { data: promoCode, error: fetchError } = await supabase
                .from('promo_codes')
                .select('*')
                .eq('code', trimmedCode)
                .single();

            console.log('📦 Promo code data:', promoCode, 'Error:', fetchError);

            if (fetchError || !promoCode) {
                console.log('❌ Code not found or error');
                return { success: false, message: 'Invalid promo code' };
            }

            // Check if already used
            if (promoCode.is_used) {
                return { success: false, message: 'This code has already been used' };
            }

            // Check if expired
            if (promoCode.expires_at && new Date(promoCode.expires_at) < new Date()) {
                return { success: false, message: 'This code has expired' };
            }

            // Check if code is restricted to a specific user
            if (promoCode.for_user_email && promoCode.for_user_email.toLowerCase() !== userEmail) {
                return { success: false, message: 'This code is not valid for your account' };
            }

            // Mark code as used
            const { error: updateError } = await supabase
                .from('promo_codes')
                .update({
                    is_used: true,
                    used_by: userId,
                    used_at: new Date().toISOString(),
                })
                .eq('id', promoCode.id);

            if (updateError) {
                console.error('Error updating promo code:', updateError);
                return { success: false, message: 'Failed to apply code. Please try again.' };
            }

            // Add credits to user
            const creditsToAdd = promoCode.credits || 50;
            const addSuccess = await addCredits(creditsToAdd);

            if (!addSuccess) {
                return { success: false, message: 'Failed to add credits. Please contact support.' };
            }

            // Log transaction
            await logTransaction(
                'promo_code',
                'Free',
                creditsToAdd,
                `Promo Code: ${trimmedCode}`
            );

            return {
                success: true,
                message: `Successfully added ${creditsToAdd} credits!`,
                credits: creditsToAdd
            };
        } catch (err) {
            console.error('Error redeeming promo code:', err);
            return { success: false, message: 'An error occurred. Please try again.' };
        }
    }, [userId, addCredits, logTransaction]);

    // Check if user can purchase extra credits (Pro only)
    const canPurchaseCredits = credits.planTier === 'pro' || credits.planTier === 'corporate';

    // Check if user has credits available
    const hasCredits = credits.creditsRemaining > 0;

    // Fetch on mount
    useEffect(() => {
        fetchCredits();
    }, [fetchCredits]);

    // Listen for auth changes
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            fetchCredits();
        });

        return () => subscription.unsubscribe();
    }, [fetchCredits]);

    // Listen for credits-updated event from other hook instances
    useEffect(() => {
        const handleCreditsUpdated = () => {
            // Skip if this instance just dispatched the event
            if (isUpdatingRef.current) return;
            fetchCredits();
        };

        window.addEventListener('credits-updated', handleCreditsUpdated);
        return () => window.removeEventListener('credits-updated', handleCreditsUpdated);
    }, [fetchCredits]);

    return {
        ...credits,
        hasCredits,
        canPurchaseCredits,
        useCredit,
        addCredits,
        upgradeToPro,
        logTransaction,
        redeemPromoCode,
        refetch: fetchCredits,
    };
}
