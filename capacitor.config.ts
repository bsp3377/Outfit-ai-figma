import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.virtualoutfit.ai',
    appName: 'VirtualOutfit AI',
    webDir: 'build',

    // Server configuration for development
    server: {
        // Use this for local development with hot reload
        // url: 'http://localhost:3000',
        // cleartext: true,

        // Allow navigation to external URLs (for OAuth, etc.)
        allowNavigation: ['*.supabase.co', '*.google.com', '*.googleapis.com'],
    },

    // Android-specific configuration
    android: {
        // Allow mixed content (http + https)
        allowMixedContent: true,
        // Capture all external links
        captureInput: true,
        // Use dark status bar
        backgroundColor: '#0f0f0f',
    },

    // iOS-specific configuration
    ios: {
        // Use content inset for safe areas
        contentInset: 'automatic',
        // Allow scroll in web view
        allowsLinkPreview: true,
        // Dark background
        backgroundColor: '#0f0f0f',
    },

    // Plugins configuration
    plugins: {
        // Splash Screen configuration
        SplashScreen: {
            launchShowDuration: 2000,
            launchAutoHide: true,
            backgroundColor: '#0f0f0f',
            androidSplashResourceName: 'splash',
            androidScaleType: 'CENTER_CROP',
            showSpinner: true,
            iosSpinnerStyle: 'large',
            spinnerColor: '#7c3aed',
            splashFullScreen: true,
            splashImmersive: true,
        },

        // Status Bar configuration
        StatusBar: {
            style: 'dark',
            backgroundColor: '#0f0f0f',
        },

        // Keyboard configuration
        Keyboard: {

            resizeOnFullScreen: true,
        },

        // Camera configuration
        Camera: {
            // Request permission on first use
            permissions: true,
        },
    },
};

export default config;
