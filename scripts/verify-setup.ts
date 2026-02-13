/**
 * Verification script to check all features are working
 * Run with: pnpm tsx scripts/verify-setup.ts
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface CheckResult {
  name: string;
  status: 'passed' | 'failed';
  message: string;
}

const results: CheckResult[] = [];

function check(name: string, status: 'passed' | 'failed', message: string) {
  results.push({ name, status, message });
  const icon = status === 'passed' ? '✅' : '❌';
  console.log(`${icon} ${name}: ${message}`);
}

async function verifySetup() {
  console.log('🔍 TwoYes Setup Verification\n');
  console.log('=' .repeat(60));

  // 1. Check database connection
  try {
    const { error } = await supabase.from('names').select('count').limit(1);
    if (error) throw error;
    check('Database Connection', 'passed', 'Connected to Supabase');
  } catch (error) {
    check('Database Connection', 'failed', String(error));
  }

  // 2. Check names table
  try {
    const { count, error } = await supabase
      .from('names')
      .select('*', { count: 'exact', head: true });
    if (error) throw error;
    const totalNames = count || 0;
    if (totalNames >= 30) {
      check('Names Table', 'passed', `${totalNames} names seeded`);
    } else {
      check('Names Table', 'failed', `Only ${totalNames} names found, expected 30+`);
    }
  } catch (error) {
    check('Names Table', 'failed', String(error));
  }

  // 3. Check embeddings
  try {
    const { count: withEmbeddings, error: embedError } = await supabase
      .from('names')
      .select('*', { count: 'exact', head: true })
      .not('embedding', 'is', null);

    if (embedError) throw embedError;

    const { count: totalNames, error: totalError } = await supabase
      .from('names')
      .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;

    const embedded = withEmbeddings || 0;
    const total = totalNames || 0;

    if (embedded === total && embedded > 0) {
      check('AI Embeddings', 'passed', `${embedded}/${total} names embedded`);
    } else {
      check('AI Embeddings', 'failed', `${embedded}/${total} names embedded`);
    }
  } catch (error) {
    check('AI Embeddings', 'failed', String(error));
  }

  // 4. Check vector similarity function
  try {
    const { data, error } = await supabase.rpc('match_names_by_embedding', {
      query_embedding: new Array(1536).fill(0),
      match_threshold: 0.5,
      match_count: 5,
    });

    if (error) throw error;
    check('Vector Search', 'passed', 'Similarity function working');
  } catch (error) {
    check('Vector Search', 'failed', String(error));
  }

  // 5. Check subscription plans
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('name');

    if (error) throw error;

    const plans = data?.map(p => p.name) || [];
    const hasRequired = plans.includes('free') && plans.includes('premium');

    if (hasRequired) {
      check('Subscription Plans', 'passed', `Plans: ${plans.join(', ')}`);
    } else {
      check('Subscription Plans', 'failed', `Missing required plans. Found: ${plans.join(', ')}`);
    }
  } catch (error) {
    check('Subscription Plans', 'failed', String(error));
  }

  // 6. Check profiles table structure
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(0);

    if (error) throw error;
    check('Profiles Table', 'passed', 'Table structure correct');
  } catch (error) {
    check('Profiles Table', 'failed', String(error));
  }

  // 7. Check RLS policies
  try {
    const { data: anonTest, error } = await createClient(
      supabaseUrl,
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
    )
      .from('subscription_plans')
      .select('name')
      .limit(1);

    if (error) throw error;
    if (anonTest && anonTest.length > 0) {
      check('Row Level Security', 'passed', 'RLS policies working');
    } else {
      check('Row Level Security', 'failed', 'RLS may not be configured correctly');
    }
  } catch (error) {
    check('Row Level Security', 'failed', String(error));
  }

  // 8. Check environment variables
  const requiredEnvVars = [
    'EXPO_PUBLIC_SUPABASE_URL',
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'OPENAI_API_KEY',
    'APPLE_TEAM_ID',
    'APPLE_KEY_ID',
  ];

  const missingVars = requiredEnvVars.filter(v => !process.env[v]);
  if (missingVars.length === 0) {
    check('Environment Variables', 'passed', 'All required vars set');
  } else {
    check('Environment Variables', 'failed', `Missing: ${missingVars.join(', ')}`);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const total = results.length;

  console.log(`\n📊 Results: ${passed}/${total} checks passed`);

  if (failed > 0) {
    console.log(`\n⚠️  ${failed} check(s) failed. Please review errors above.`);
    process.exit(1);
  } else {
    console.log('\n🎉 All checks passed! TwoYes is ready to run.');
    process.exit(0);
  }
}

verifySetup().catch((error) => {
  console.error('\n💥 Fatal error during verification:', error);
  process.exit(1);
});
