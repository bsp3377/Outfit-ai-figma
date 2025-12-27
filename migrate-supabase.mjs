/**
 * Supabase Data Migration Script
 * Migrates data from old Supabase to new Supabase
 * 
 * Run: node migrate-supabase.mjs
 */

import { createClient } from '@supabase/supabase-js';

// Old Supabase Configuration
const OLD_SUPABASE_URL = 'https://vjbbfgqoyfiwzwzbzjmr.supabase.co';
const OLD_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqYmJmZ3FveWZpd3p3emJ6am1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNTYwOTYsImV4cCI6MjA4MTczMjA5Nn0.J_Tu7kjC9fdDVer0LWVFb1zybPMAZmx7U65APCrWKsU';

// New Supabase Configuration
const NEW_SUPABASE_URL = 'https://qzbwvvinwynmwxzwtave.supabase.co';
const NEW_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6Ynd2dmlud3lubXd4end0YXZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4MjM0MjUsImV4cCI6MjA4MjM5OTQyNX0.jzzFvGTSw2sXyUe3AAgxb4ioAPrqHbrnF-e9psZcVTs';

// Create clients
const oldSupabase = createClient(OLD_SUPABASE_URL, OLD_SUPABASE_ANON_KEY);
const newSupabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_ANON_KEY);

// Tables to migrate (order matters for foreign key constraints)
const TABLES_TO_MIGRATE = [
    'site_content',
    'testimonials',
    'partner_logos',
    'terms_and_conditions',
    'promo_codes',
    // Note: profiles, user_credits, generated_images, etc. depend on auth.users
    // which cannot be migrated directly
];

async function migrateTable(tableName) {
    console.log(`\n📦 Migrating table: ${tableName}`);

    try {
        // Fetch all data from old database
        const { data: oldData, error: fetchError } = await oldSupabase
            .from(tableName)
            .select('*');

        if (fetchError) {
            console.error(`  ❌ Error fetching from old DB: ${fetchError.message}`);
            return { success: false, error: fetchError.message };
        }

        if (!oldData || oldData.length === 0) {
            console.log(`  ⚪ No data to migrate`);
            return { success: true, count: 0 };
        }

        console.log(`  📊 Found ${oldData.length} records`);

        // Insert into new database
        const { data: newData, error: insertError } = await newSupabase
            .from(tableName)
            .upsert(oldData, {
                onConflict: 'id',
                ignoreDuplicates: false
            });

        if (insertError) {
            console.error(`  ❌ Error inserting to new DB: ${insertError.message}`);
            return { success: false, error: insertError.message };
        }

        console.log(`  ✅ Migrated ${oldData.length} records successfully`);
        return { success: true, count: oldData.length };

    } catch (err) {
        console.error(`  ❌ Unexpected error: ${err.message}`);
        return { success: false, error: err.message };
    }
}

async function runMigration() {
    console.log('🚀 Starting Supabase Data Migration');
    console.log('=====================================');
    console.log(`From: ${OLD_SUPABASE_URL}`);
    console.log(`To:   ${NEW_SUPABASE_URL}`);
    console.log('=====================================\n');

    const results = {};

    for (const table of TABLES_TO_MIGRATE) {
        results[table] = await migrateTable(table);
    }

    console.log('\n=====================================');
    console.log('📋 Migration Summary:');
    console.log('=====================================');

    for (const [table, result] of Object.entries(results)) {
        const status = result.success ? '✅' : '❌';
        const detail = result.success ? `${result.count} records` : result.error;
        console.log(`${status} ${table}: ${detail}`);
    }

    console.log('\n⚠️  Note: User data (profiles, credits, images) requires manual migration');
    console.log('    because it depends on auth.users which cannot be migrated via API.\n');
}

// Run the migration
runMigration().catch(console.error);
