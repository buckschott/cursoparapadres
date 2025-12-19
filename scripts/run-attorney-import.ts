/**
 * Attorney Import Script for Supabase
 * Matches actual database schema - excludes generated columns
 */

import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface Attorney {
  firm_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  referral_count: number;
  cards_sent: number;
  current_year_referrals: number;
  needs_review: boolean;
}

function parseNumberField(value: string): { referral_count: number; cards_sent: number } {
  if (!value || value.trim() === '') {
    return { referral_count: 0, cards_sent: 0 };
  }

  const trimmed = value.trim();

  // Pattern 1: "40 Taken / 80 Sent"
  const takenSentMatch = trimmed.match(/(\d+)\s*Taken\s*\/\s*(\d+)\s*Sent/i);
  if (takenSentMatch) {
    return {
      referral_count: parseInt(takenSentMatch[1], 10),
      cards_sent: parseInt(takenSentMatch[2], 10)
    };
  }

  // Pattern 2: "10 / 20" - numbers with slashes (sum for cards_sent)
  const multipleNumbers = trimmed.match(/^[\d\s\/]+$/);
  if (multipleNumbers) {
    const numbers = trimmed.split('/').map(n => parseInt(n.trim(), 10) || 0);
    return {
      referral_count: 0,
      cards_sent: numbers.reduce((sum, n) => sum + n, 0)
    };
  }

  // Pattern 3: Single number
  const singleNumber = parseInt(trimmed, 10);
  if (!isNaN(singleNumber)) {
    return { referral_count: 0, cards_sent: singleNumber };
  }

  // Pattern 4: Contains numbers like "10-Brochures"
  const anyNumbers = trimmed.match(/\d+/g);
  if (anyNumbers) {
    return {
      referral_count: 0,
      cards_sent: anyNumbers.reduce((sum, n) => sum + parseInt(n, 10), 0)
    };
  }

  return { referral_count: 0, cards_sent: 0 };
}

function isValidEmail(email: string): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function needsAddressReview(address: string | null, city: string | null, state: string | null, zip: string | null): boolean {
  return !address || !city || !state || !zip || 
         address.trim() === '' || city.trim() === '' || 
         state.trim() === '' || zip.trim() === '';
}

function parseCSV(csvPath: string): Attorney[] {
  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  
  const records = parse(fileContent, {
    columns: false,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true
  });

  const attorneys: Attorney[] = [];
  let skipped = 0;

  for (const row of records) {
    const firmName = row[0]?.trim() || null;
    const firstName = row[1]?.trim() || null;
    const lastName = row[2]?.trim() || null;
    const email = row[3]?.trim() || null;
    const phone = row[5]?.trim() || null;
    const address = row[6]?.trim() || null;
    const city = row[7]?.trim() || null;
    const state = row[8]?.trim() || null;
    const zip = row[9]?.trim() || null;
    const numberField = row[11] || '';

    // Skip if no identifying info
    if (!firmName && !firstName && !lastName && !isValidEmail(email || '')) {
      skipped++;
      continue;
    }

    const { referral_count, cards_sent } = parseNumberField(numberField);

    attorneys.push({
      firm_name: firmName || null,
      first_name: firstName || null,
      last_name: lastName || null,
      email: isValidEmail(email || '') ? email : null,
      phone: phone || null,
      address: address || null,
      city: city || null,
      state: state || null,
      zip: zip || null,
      referral_count,
      cards_sent,
      current_year_referrals: 0,
      needs_review: needsAddressReview(address, city, state, zip)
    });
  }

  console.log(`Parsed ${attorneys.length} attorneys, skipped ${skipped}`);
  return attorneys;
}

async function clearExistingData() {
  console.log('\nStep 1: Clearing existing attorney data...');
  
  const { error } = await supabase
    .from('attorneys')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  
  if (error) {
    console.error('Error clearing data:', error);
    process.exit(1);
  }
  
  console.log('✓ Existing data cleared');
}

async function importAttorneys(attorneys: Attorney[]) {
  console.log(`\nStep 2: Importing ${attorneys.length} attorneys...`);
  
  const batchSize = 500;
  let imported = 0;
  let failed = 0;
  
  for (let i = 0; i < attorneys.length; i += batchSize) {
    const batch = attorneys.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(attorneys.length / batchSize);
    
    const { error } = await supabase.from('attorneys').insert(batch);
    
    if (error) {
      console.error(`Batch ${batchNum} error:`, error);
      failed += batch.length;
    } else {
      imported += batch.length;
      console.log(`✓ Batch ${batchNum}/${totalBatches} complete (${imported} imported)`);
    }
  }
  
  console.log(`\nImported: ${imported}`);
  console.log(`Failed: ${failed}`);
}

async function verifyImport() {
  console.log('\nStep 3: Verifying import...');
  
  const { count } = await supabase
    .from('attorneys')
    .select('*', { count: 'exact', head: true });
  
  // Find C.E. Schmidt
  const { data: schmidt } = await supabase
    .from('attorneys')
    .select('firm_name, first_name, last_name, referral_count, cards_sent')
    .ilike('firm_name', '%C. E. Schmidt%')
    .single();
  
  const { count: needsReviewCount } = await supabase
    .from('attorneys')
    .select('*', { count: 'exact', head: true })
    .eq('needs_review', true);
  
  console.log(`\nTotal records: ${count}`);
  console.log(`Needs review: ${needsReviewCount}`);
  
  if (schmidt) {
    console.log(`\n=== C.E. Schmidt Verification ===`);
    console.log(`  Firm: ${schmidt.firm_name}`);
    console.log(`  referral_count: ${schmidt.referral_count} (expected: 40)`);
    console.log(`  cards_sent: ${schmidt.cards_sent} (expected: 80)`);
    
    if (schmidt.referral_count === 40 && schmidt.cards_sent === 80) {
      console.log('  ✓ CORRECT!');
    } else {
      console.log('  ✗ VALUES INCORRECT');
    }
  } else {
    console.log('\nCould not find C.E. Schmidt for verification');
  }
}

async function main() {
  console.log('=== Attorney Import Script ===\n');
  
  // Try to find the CSV
  let sourcePath = '';
  if (fs.existsSync(join(__dirname, 'attorney.csv'))) {
    sourcePath = join(__dirname, 'attorney.csv');
  } else if (fs.existsSync(join(__dirname, '..', 'attorney.csv'))) {
    sourcePath = join(__dirname, '..', 'attorney.csv');
  } else {
    console.error('Cannot find attorney.csv');
    console.error('Please copy attorney.csv to the scripts folder');
    process.exit(1);
  }
  
  console.log(`Reading from: ${sourcePath}`);
  const attorneys = parseCSV(sourcePath);
  
  await clearExistingData();
  await importAttorneys(attorneys);
  await verifyImport();
  
  console.log('\n=== Done! ===');
}

main().catch(console.error);
