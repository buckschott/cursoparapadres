/**
 * Attorney Import Script (Simplified)
 * 
 * Usage:
 * 1. Place attorney.csv in project root
 * 2. Run: npx ts-node scripts/import-attorneys.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Parse "2 Taken / 20 Sent" or just "20"
function parseCardsSent(field: string): number {
  if (!field) return 0;
  const sentMatch = field.match(/(\d+)\s*Sent/i);
  if (sentMatch) return parseInt(sentMatch[1]) || 0;
  const slashMatch = field.match(/\/\s*(\d+)/);
  if (slashMatch) return parseInt(slashMatch[1]) || 0;
  const numMatch = field.match(/^(\d+)$/);
  if (numMatch) return parseInt(numMatch[1]) || 0;
  return 0;
}

// Parse most recent date from "6/29/2018 / 3/10/2023"
function parseLastDate(field: string): string | null {
  if (!field) return null;
  const dates = field.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/g);
  if (!dates) return null;
  
  let latest: Date | null = null;
  for (const dateStr of dates) {
    const [m, d, y] = dateStr.split('/').map(Number);
    const year = y < 100 ? (y < 50 ? 2000 + y : 1900 + y) : y;
    const date = new Date(year, m - 1, d);
    if (!latest || date > latest) latest = date;
  }
  return latest ? latest.toISOString().split('T')[0] : null;
}

// Sum referrals from "05=1 / 06=2 / 07=3" format
function parseReferralCount(field: string): number {
  if (!field) return 0;
  let total = 0;
  const matches = field.matchAll(/=(\d+)/g);
  for (const match of matches) {
    total += parseInt(match[1]) || 0;
  }
  // Handle standalone numbers like "2" or "3"
  if (total === 0) {
    const num = field.match(/^(\d+)$/);
    if (num) total = parseInt(num[1]) || 0;
  }
  return total;
}

// Get current year referrals from "24=5" 
function parseCurrentYearReferrals(field: string): number {
  if (!field) return 0;
  const currentYr = new Date().getFullYear() % 100; // e.g., 25 for 2025
  const match = field.match(new RegExp(`${currentYr}=(\\d+)`));
  return match ? parseInt(match[1]) || 0 : 0;
}

async function importAttorneys() {
  console.log('🏛️  Attorney Import\n');
  
  const csvPath = './attorney.csv';
  if (!fs.existsSync(csvPath)) {
    console.error('❌ attorney.csv not found');
    process.exit(1);
  }
  
  const lines = fs.readFileSync(csvPath, 'utf-8').split('\n').filter(l => l.trim());
  console.log(`📄 Found ${lines.length} rows\n`);
  
  const records: any[] = [];
  
  for (const line of lines) {
    const f = parseCSVLine(line);
    if (f.length < 4) continue;
    
    // Skip if no useful info
    if (!f[1] && !f[2] && !f[3] && !f[0]) continue;
    
    records.push({
      firm_name: f[0] || null,
      first_name: f[1] || null,
      last_name: f[2] || null,
      email: f[3]?.toLowerCase().includes('@') ? f[3].toLowerCase().trim() : null,
      phone: f[5]?.replace(/[^\d-\s]/g, '').trim() || null,
      address: f[6] || null,
      city: f[7] || null,
      state: f[8] || null,
      zip: f[9] || null,
      cards_sent: parseCardsSent(f[11]),
      last_cards_sent_date: parseLastDate(f[12]),
      referral_count: parseReferralCount(f[14]),
      current_year_referrals: parseCurrentYearReferrals(f[14]),
      referral_year: new Date().getFullYear()
    });
  }
  
  console.log(`✓ Parsed ${records.length} attorneys\n`);
  
  // Insert in batches
  const BATCH = 100;
  let inserted = 0;
  
  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH);
    const { data, error } = await supabase.from('attorneys').insert(batch).select('id');
    
    if (error) {
      console.error(`Batch error:`, error.message);
    } else {
      inserted += data?.length || 0;
      process.stdout.write(`Progress: ${inserted}/${records.length}\r`);
    }
  }
  
  console.log(`\n\n✅ Imported ${inserted} attorneys`);
  
  // Quick stats
  const { data: top } = await supabase
    .from('attorneys')
    .select('first_name, last_name, referral_count')
    .order('referral_count', { ascending: false })
    .limit(5);
  
  if (top?.length) {
    console.log('\n🏆 Top Referrers:');
    top.forEach((a, i) => {
      console.log(`   ${i + 1}. ${a.first_name || ''} ${a.last_name || ''}: ${a.referral_count}`);
    });
  }
  
  const { count } = await supabase
    .from('attorneys')
    .select('*', { count: 'exact', head: true })
    .gt('referral_count', supabase.rpc('cards_sent'));
  
  console.log(`\n📬 Attorneys needing cards: Check dashboard after import`);
}

importAttorneys().catch(console.error);
