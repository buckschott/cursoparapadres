import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

/**
 * Attorney Search API
 * 
 * Searches attorneys by:
 * - Full name (first + last)
 * - Email address
 * - Certificate email address
 * 
 * Returns top 10 matches sorted by referral count (most active first).
 * 
 * Usage: GET /api/attorney-match?q=searchterm
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  // Require at least 2 characters to search
  if (!query || query.length < 2) {
    return NextResponse.json({ attorneys: [] });
  }

  try {
    const supabase = createServerClient();
    const searchTerm = query.toLowerCase().trim();

    // Search by name OR email OR certificate_email
    const { data: attorneys, error } = await supabase
      .from('attorneys')
      .select('id, first_name, last_name, firm_name, email, certificate_email')
      .or(
        `full_name_search.ilike.%${searchTerm}%,` +
        `email.ilike.%${searchTerm}%,` +
        `certificate_email.ilike.%${searchTerm}%`
      )
      .order('referral_count', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Attorney search error:', error);
      return NextResponse.json({ attorneys: [] });
    }

    return NextResponse.json({ attorneys: attorneys || [] });
    
  } catch (err) {
    console.error('Attorney match API error:', err);
    return NextResponse.json({ attorneys: [] });
  }
}
