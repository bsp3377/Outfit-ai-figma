/**
 * Analytics Utility
 * 
 * Centralized analytics and error tracking for Outfit AI Studio.
 * Supports Google Analytics 4 and Sentry.
 */

// ============================================
// Google Analytics 4
// ============================================

declare global {
    interface Window {
        gtag: (...args: any[]) => void;
        dataLayer: any[];
    }
}

// GA4 Measurement ID
export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-1B7WNJ8WG4';
export const isGAConfigured = !!GA_MEASUREMENT_ID;

/**
 * Track a page view
 */
export function trackPageView(path: string, title?: string) {
    if (!isGAConfigured || typeof window.gtag === 'undefined') return;

    window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: path,
        page_title: title,
    });
}

/**
 * Track a custom event
 */
export function trackEvent(
    eventName: string,
    params?: Record<string, string | number | boolean>
) {
    if (!isGAConfigured || typeof window.gtag === 'undefined') return;

    window.gtag('event', eventName, params);
}

// ============================================
// Pre-defined Events
// ============================================

export const Analytics = {
    // Auth events
    signup: (method: string = 'email') => trackEvent('sign_up', { method }),
    login: (method: string = 'email') => trackEvent('login', { method }),
    logout: () => trackEvent('logout'),

    // Payment events
    paymentInitiated: (planId: string, amount: number) =>
        trackEvent('begin_checkout', {
            currency: 'INR',
            value: amount / 100,
            items: [{ item_id: planId }]
        }),

    paymentCompleted: (planId: string, paymentId: string, amount: number) =>
        trackEvent('purchase', {
            currency: 'INR',
            value: amount / 100,
            transaction_id: paymentId,
            items: [{ item_id: planId }]
        }),

    paymentFailed: (planId: string, error?: string) =>
        trackEvent('payment_failed', { plan_id: planId, error: error || 'unknown' }),

    // Generation events
    generationStarted: (type: string) =>
        trackEvent('generation_started', { generation_type: type }),

    generationCompleted: (type: string, duration: number) =>
        trackEvent('generation_completed', {
            generation_type: type,
            duration_seconds: duration
        }),

    generationFailed: (type: string, error: string) =>
        trackEvent('generation_failed', { generation_type: type, error }),

    // Feature usage
    featureUsed: (featureName: string) =>
        trackEvent('feature_used', { feature_name: featureName }),

    // Page views
    pageView: trackPageView,
};

// ============================================
// Sentry Error Tracking
// ============================================

// Note: Sentry is initialized in main.tsx
// This provides utility functions for manual error capture

import * as Sentry from '@sentry/react';

export const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || '';
export const isSentryConfigured = !!SENTRY_DSN;

/**
 * Initialize Sentry - call this in main.tsx
 */
export function initSentry() {
    if (!isSentryConfigured) {
        console.warn('Sentry DSN not configured. Error tracking disabled.');
        return;
    }

    Sentry.init({
        dsn: SENTRY_DSN,
        environment: import.meta.env.MODE,
        integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration(),
        ],
        // Performance Monitoring
        tracesSampleRate: 0.1, // 10% of transactions
        // Session Replay
        replaysSessionSampleRate: 0.1, // 10% of sessions
        replaysOnErrorSampleRate: 1.0, // 100% on error
    });

    console.log('✅ Sentry initialized');
}

/**
 * Capture an error with optional context
 */
export function captureError(error: Error, context?: Record<string, any>) {
    console.error('Error:', error);

    if (isSentryConfigured) {
        Sentry.captureException(error, {
            extra: context,
        });
    }
}

/**
 * Set user context for Sentry
 */
export function setUserContext(userId: string, email?: string, name?: string) {
    if (isSentryConfigured) {
        Sentry.setUser({
            id: userId,
            email,
            username: name,
        });
    }
}

/**
 * Clear user context (on logout)
 */
export function clearUserContext() {
    if (isSentryConfigured) {
        Sentry.setUser(null);
    }
}

export default Analytics;
