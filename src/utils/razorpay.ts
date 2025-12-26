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

// Store scroll position before locking
let scrollPosition = 0;

/**
 * Lock body scroll - prevents scrolling behind modals
 * Scrolls to top first so Razorpay modal is visible
 */
function lockScroll(): void {
    scrollPosition = window.pageYOffset;
    // Scroll to top so Razorpay modal is visible
    window.scrollTo(0, 0);
    // Lock scrolling
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
}

/**
 * Unlock body scroll - restores scrolling and position
 */
function unlockScroll(): void {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    // Restore scroll position
    window.scrollTo(0, scrollPosition);
}

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

// Credit pack pricing (amounts in paise)
export const CREDIT_PACKS = {
    'pack-10': {
        id: 'pack-10',
        name: '10 Credits',
        credits: 10,
        amount: 10000, // ₹100 in paise
        currency: 'INR',
        pricePerCredit: 10,
    },
    'pack-25': {
        id: 'pack-25',
        name: '25 Credits',
        credits: 25,
        amount: 20000, // ₹200 in paise
        currency: 'INR',
        pricePerCredit: 8,
        popular: true,
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
            unlockScroll();
            onSuccess(response);
        },
        modal: {
            ondismiss: () => {
                console.log('Payment modal dismissed');
                unlockScroll();
                onDismiss?.();
            },
            escape: true,
            animation: true,
        },
    };

    try {
        const razorpay = new window.Razorpay(options);

        razorpay.on('payment.failed', () => {
            unlockScroll();
            onFailure('Payment failed. Please try again.');
        });

        // Lock scroll when modal opens
        lockScroll();
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

/**
 * Initialize Razorpay payment for credit pack purchase
 */
export function initiateCreditPackPayment({
    packId,
    userEmail,
    userName,
    userPhone,
    onSuccess,
    onFailure,
    onDismiss,
}: {
    packId: keyof typeof CREDIT_PACKS;
    userEmail?: string;
    userName?: string;
    userPhone?: string;
    onSuccess: (response: RazorpaySuccessResponse, credits: number) => void;
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

    const pack = CREDIT_PACKS[packId];
    if (!pack) {
        onFailure('Invalid credit pack selected.');
        return;
    }

    const options: RazorpayOptions = {
        key: RAZORPAY_KEY_ID,
        amount: pack.amount,
        currency: pack.currency,
        name: 'Outfit AI Studio',
        description: `${pack.name} - Extra Generation Credits`,
        image: '/favicon.ico',
        prefill: {
            name: userName || '',
            email: userEmail || '',
            contact: userPhone || '',
        },
        notes: {
            pack_id: pack.id,
            credits: String(pack.credits),
            type: 'credit_pack',
        },
        theme: {
            color: '#9333ea',
        },
        handler: (response: RazorpaySuccessResponse) => {
            console.log('Credit pack payment successful:', response);
            unlockScroll();
            onSuccess(response, pack.credits);
        },
        modal: {
            ondismiss: () => {
                console.log('Credit pack payment modal dismissed');
                unlockScroll();
                onDismiss?.();
            },
            escape: true,
            animation: true,
        },
    };

    try {
        const razorpay = new window.Razorpay(options);

        razorpay.on('payment.failed', () => {
            unlockScroll();
            onFailure('Payment failed. Please try again.');
        });

        // Lock scroll when modal opens
        lockScroll();
        razorpay.open();
    } catch (error) {
        console.error('Razorpay initialization error:', error);
        onFailure('Failed to initialize payment. Please try again.');
    }
}
