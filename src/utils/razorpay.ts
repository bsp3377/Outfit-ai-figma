/**
 * Razorpay Payment Gateway Utility
 * 
 * This module provides functions to initialize and handle Razorpay payments.
 * Configure your Razorpay Key ID in .env as VITE_RAZORPAY_KEY_ID
 */

// Razorpay Key from environment variables
export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || '';

// Check if Razorpay is configured
export const isRazorpayConfigured = !!RAZORPAY_KEY_ID;

// Plan pricing configuration (amounts in paise - 1 INR = 100 paise)
export const PRICING_PLANS = {
    pro: {
        id: 'pro',
        name: 'Pro Plan',
        amount: 99900, // ₹999 in paise
        currency: 'INR',
        description: '100 generations/month',
        period: 'monthly',
    },
} as const;

// TypeScript type definitions for Razorpay
declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
    }
}

export interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    image?: string;
    order_id?: string;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    notes?: Record<string, string>;
    theme?: {
        color?: string;
    };
    handler: (response: RazorpaySuccessResponse) => void;
    modal?: {
        ondismiss?: () => void;
        escape?: boolean;
        animation?: boolean;
    };
}

export interface RazorpaySuccessResponse {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
}

export interface RazorpayInstance {
    open: () => void;
    close: () => void;
    on: (event: string, callback: () => void) => void;
}

export interface PaymentResult {
    success: boolean;
    paymentId?: string;
    error?: string;
}

/**
 * Initialize Razorpay payment for a specific plan
 */
export function initiateRazorpayPayment({
    planId,
    userEmail,
    userName,
    userPhone,
    onSuccess,
    onFailure,
    onDismiss,
}: {
    planId: keyof typeof PRICING_PLANS;
    userEmail?: string;
    userName?: string;
    userPhone?: string;
    onSuccess: (response: RazorpaySuccessResponse) => void;
    onFailure: (error: string) => void;
    onDismiss?: () => void;
}): void {
    // Check if Razorpay key is configured
    if (!isRazorpayConfigured) {
        onFailure('Razorpay is not configured. Please add VITE_RAZORPAY_KEY_ID to your environment.');
        return;
    }

    // Check if Razorpay script is loaded
    if (typeof window.Razorpay === 'undefined') {
        onFailure('Razorpay SDK not loaded. Please refresh the page and try again.');
        return;
    }

    const plan = PRICING_PLANS[planId];
    if (!plan) {
        onFailure('Invalid plan selected.');
        return;
    }

    const options: RazorpayOptions = {
        key: RAZORPAY_KEY_ID,
        amount: plan.amount,
        currency: plan.currency,
        name: 'Outfit AI Studio',
        description: `${plan.name} - ${plan.description}`,
        image: '/favicon.ico', // You can replace with your logo URL
        prefill: {
            name: userName || '',
            email: userEmail || '',
            contact: userPhone || '',
        },
        notes: {
            plan_id: plan.id,
            period: plan.period,
        },
        theme: {
            color: '#9333ea', // Purple color matching your brand
        },
        handler: (response: RazorpaySuccessResponse) => {
            console.log('Payment successful:', response);
            onSuccess(response);
        },
        modal: {
            ondismiss: () => {
                console.log('Payment modal dismissed');
                onDismiss?.();
            },
            escape: true,
            animation: true,
        },
    };

    try {
        const razorpay = new window.Razorpay(options);

        razorpay.on('payment.failed', () => {
            onFailure('Payment failed. Please try again.');
        });

        razorpay.open();
    } catch (error) {
        console.error('Razorpay initialization error:', error);
        onFailure('Failed to initialize payment. Please try again.');
    }
}

/**
 * Format amount from paise to rupees with currency symbol
 */
export function formatAmount(amountInPaise: number): string {
    return `₹${(amountInPaise / 100).toLocaleString('en-IN')}`;
}
