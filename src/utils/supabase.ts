import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Access environment variables using Vite's import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check for missing credentials but don't crash the app
const isMissingCredentials = !supabaseUrl || !supabaseAnonKey;

if (isMissingCredentials) {
    console.warn('⚠️ Supabase credentials missing! Please check your .env file.');
    console.warn('The app will run in demo mode without database features.');
}

// Create client with placeholder values if missing (will fail on actual API calls but won't crash)
export const supabase: SupabaseClient = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-anon-key'
);

// Export a helper to check if Supabase is properly configured
export const isSupabaseConfigured = !isMissingCredentials;
