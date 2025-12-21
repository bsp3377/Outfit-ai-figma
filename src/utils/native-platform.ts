/**
 * Native Platform Utilities for Capacitor
 * 
 * This module provides platform detection and native API wrappers
 * for use in the VirtualOutfit AI mobile app.
 * 
 * NOTE: These utilities are safe to call on web - they gracefully
 * degrade when native plugins are not available.
 */

import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';

// ============================================
// Platform Detection
// ============================================

/**
 * Check if running as a native app (Android or iOS)
 */
export const isNativePlatform = (): boolean => {
    return Capacitor.isNativePlatform();
};

/**
 * Check if running on iOS
 */
export const isIOS = (): boolean => {
    return Capacitor.getPlatform() === 'ios';
};

/**
 * Check if running on Android
 */
export const isAndroid = (): boolean => {
    return Capacitor.getPlatform() === 'android';
};

/**
 * Check if running on web
 */
export const isWeb = (): boolean => {
    return Capacitor.getPlatform() === 'web';
};

/**
 * Get the current platform name
 */
export const getPlatformName = (): 'ios' | 'android' | 'web' => {
    return Capacitor.getPlatform() as 'ios' | 'android' | 'web';
};

// ============================================
// Status Bar Configuration
// ============================================

/**
 * Configure status bar for dark theme
 */
export const setDarkStatusBar = async (): Promise<void> => {
    if (!isNativePlatform()) return;

    try {
        await StatusBar.setStyle({ style: Style.Dark });
        if (isAndroid()) {
            await StatusBar.setBackgroundColor({ color: '#0f0f0f' });
        }
    } catch (error) {
        console.warn('StatusBar configuration failed:', error);
    }
};

/**
 * Configure status bar for light theme
 */
export const setLightStatusBar = async (): Promise<void> => {
    if (!isNativePlatform()) return;

    try {
        await StatusBar.setStyle({ style: Style.Light });
        if (isAndroid()) {
            await StatusBar.setBackgroundColor({ color: '#ffffff' });
        }
    } catch (error) {
        console.warn('StatusBar configuration failed:', error);
    }
};

/**
 * Hide the status bar
 */
export const hideStatusBar = async (): Promise<void> => {
    if (!isNativePlatform()) return;

    try {
        await StatusBar.hide();
    } catch (error) {
        console.warn('StatusBar hide failed:', error);
    }
};

/**
 * Show the status bar
 */
export const showStatusBar = async (): Promise<void> => {
    if (!isNativePlatform()) return;

    try {
        await StatusBar.show();
    } catch (error) {
        console.warn('StatusBar show failed:', error);
    }
};

// ============================================
// Splash Screen
// ============================================

/**
 * Hide the splash screen
 */
export const hideSplashScreen = async (): Promise<void> => {
    if (!isNativePlatform()) return;

    try {
        await SplashScreen.hide({
            fadeOutDuration: 300,
        });
    } catch (error) {
        console.warn('SplashScreen hide failed:', error);
    }
};

/**
 * Show the splash screen
 */
export const showSplashScreen = async (): Promise<void> => {
    if (!isNativePlatform()) return;

    try {
        await SplashScreen.show({
            autoHide: false,
        });
    } catch (error) {
        console.warn('SplashScreen show failed:', error);
    }
};

// ============================================
// Keyboard Handling
// ============================================

/**
 * Setup keyboard listeners and add body classes for keyboard state
 */
export const setupKeyboardListeners = (): (() => void) | null => {
    if (!isNativePlatform()) return null;

    const handleKeyboardShow = () => {
        document.body.classList.add('keyboard-open');
    };

    const handleKeyboardHide = () => {
        document.body.classList.remove('keyboard-open');
    };

    // Add listeners
    Keyboard.addListener('keyboardWillShow', handleKeyboardShow);
    Keyboard.addListener('keyboardWillHide', handleKeyboardHide);

    // Return cleanup function
    return () => {
        Keyboard.removeAllListeners();
        document.body.classList.remove('keyboard-open');
    };
};

/**
 * Hide the keyboard programmatically
 */
export const hideKeyboard = async (): Promise<void> => {
    if (!isNativePlatform()) return;

    try {
        await Keyboard.hide();
    } catch (error) {
        console.warn('Keyboard hide failed:', error);
    }
};

// ============================================
// App Initialization
// ============================================

/**
 * Initialize native platform features
 * Call this once when the app starts
 */
export const initializeNativePlatform = async (isDarkMode: boolean = true): Promise<void> => {
    if (!isNativePlatform()) {
        console.log('📱 Running on web - native features disabled');
        return;
    }

    console.log(`📱 Running on ${getPlatformName()} - initializing native features`);

    // Configure status bar based on theme
    if (isDarkMode) {
        await setDarkStatusBar();
    } else {
        await setLightStatusBar();
    }

    // Setup keyboard listeners
    setupKeyboardListeners();

    // Hide splash screen after a short delay
    setTimeout(() => {
        hideSplashScreen();
    }, 500);

    console.log('✅ Native platform initialized');
};
