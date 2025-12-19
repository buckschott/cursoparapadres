// /app/api/attorney-match/route.ts
// Updated to set needs_review = true when creating new attorneys

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Levenshtein distance for fuzzy matching
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();

  for (let i = 0; i <= bLower.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= aLower.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= bLower.length; i++) {
    for (let j = 1; j <= aLower.length; j++) {
      if (bLower.charAt(i - 1) === aLower.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[bLower.length][aLower.length];
}

function calculateSimilarity(a: string, b: string): number {
  const maxLength = Math.max(a.length, b.length);
  if (maxLength === 0) return 1;
  const distance = levenshteinDistance(a, b);
  return 1 - distance / maxLength;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { attorneyName, attorneyEmail } = body;

    if (!attorneyName && !attorneyEmail) {
      return NextResponse.json(
        { error: 'Attorney name or email required' },
        { status: 400 }
      );
    }

    // Try to find existing attorney
    let matchedAttorney = null;
    let matchType = 'none';

    // First, try exact email match (most reliable)
    if (attorneyEmail) {
      const { data: emailMatch } = await supabase
        .from('attorneys')
        .select('*')
        .ilike('email', attorneyEmail)
        .single();

      if (emailMatch) {
        matchedAttorney = emailMatch;
        matchType = 'email';
      }
    }

    // If no email match, try fuzzy name matching
    if (!matchedAttorney && attorneyName) {
      const { data: allAttorneys } = await supabase
        .from('attorneys')
        .select('*');

      if (allAttorneys) {
        let bestMatch = null;
        let bestSimilarity = 0;

        for (const attorney of allAttorneys) {
          const similarity = calculateSimilarity(attorneyName, attorney.name);
          if (similarity > bestSimilarity && similarity >= 0.8) {
            bestMatch = attorney;
            bestSimilarity = similarity;
          }
        }

        if (bestMatch) {
          matchedAttorney = bestMatch;
          matchType = 'fuzzy';
        }
      }
    }

    // If match found, increment referral counts
    if (matchedAttorney) {
      const { data: updated, error: updateError } = await supabase
        .from('attorneys')
        .update({
          referral_count: (matchedAttorney.referral_count || 0) + 1,
          current_year_referrals: (matchedAttorney.current_year_referrals || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', matchedAttorney.id)
        .select()
        .single();

      if (updateError) {
        console.error('Update error:', updateError);
        return NextResponse.json({ error: 'Failed to update attorney' }, { status: 500 });
      }

      return NextResponse.json({
        action: 'updated',
        matchType,
        attorney: updated
      });
    }

    // No match found - create new attorney with needs_review = true
    const newAttorney = {
      name: attorneyName || 'Unknown',
      email: attorneyEmail || null,
      phone: null,
      address: null,
      city: null,
      state: null,
      zip: null,
      referral_count: 1,
      cards_sent: 0,
      current_year_referrals: 1,
      needs_review: true, // Flag for manual address lookup
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: created, error: createError } = await supabase
      .from('attorneys')
      .insert(newAttorney)
      .select()
      .single();

    if (createError) {
      console.error('Create error:', createError);
      return NextResponse.json({ error: 'Failed to create attorney' }, { status: 500 });
    }

    return NextResponse.json({
      action: 'created',
      needsReview: true, // Signal to caller that this needs manual attention
      attorney: created
    });

  } catch (error) {
    console.error('Attorney match error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
