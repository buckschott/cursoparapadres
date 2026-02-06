// =============================================================================
// SEARCH ANALYTICS API ROUTE
// =============================================================================
// Path: /app/api/admin/support/search-analytics/route.ts
// =============================================================================
//
// Fetches Google Search Console data for both PKF domains.
// Requires GOOGLE_SERVICE_ACCOUNT_KEY env var (JSON string of service account).
//
// The service account email must be added as a user (read access) in
// Google Search Console for both properties.
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { isAdmin } from '@/lib/admin';
import { GoogleAuth } from 'google-auth-library';

// ============================================================================
// CONSTANTS
// ============================================================================

const SITES = {
  pkf: 'sc-domain:puttingkidsfirst.org',
  cpp: 'sc-domain:claseparapadres.com',
} as const;

// Fallback: if domain properties aren't set up, try URL prefix
const SITES_URL_PREFIX = {
  pkf: 'https://puttingkidsfirst.org/',
  cpp: 'https://www.claseparapadres.com/',
} as const;

const DATE_RANGES = {
  '7d': 7,
  '28d': 28,
  '90d': 90,
} as const;

const SEARCH_CONSOLE_API = 'https://www.googleapis.com/webmasters/v3/sites';

// ============================================================================
// HELPERS
// ============================================================================

function getDateString(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

async function getAccessToken(): Promise<string> {
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!keyJson) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable not set');
  }

  let credentials;
  try {
    credentials = JSON.parse(keyJson);
  } catch {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is not valid JSON');
  }

  const auth = new GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });

  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  
  if (!tokenResponse.token) {
    throw new Error('Failed to obtain access token from Google');
  }

  return tokenResponse.token;
}

async function querySearchConsole(
  accessToken: string,
  siteUrl: string,
  startDate: string,
  endDate: string,
  dimensions: string[],
  rowLimit: number = 25,
): Promise<{ rows: SearchConsoleRow[] } | null> {
  const encodedSiteUrl = encodeURIComponent(siteUrl);
  const url = `${SEARCH_CONSOLE_API}/${encodedSiteUrl}/searchAnalytics/query`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      startDate,
      endDate,
      dimensions,
      rowLimit,
      // GSC data has a 2-3 day lag, so endDate should account for that
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Search Console API error (${response.status}):`, errorText);
    
    // If 403, the site might not be accessible or might use a different URL format
    if (response.status === 403) {
      return null; // Signal to try alternate URL format
    }
    
    throw new Error(`Search Console API returned ${response.status}: ${errorText}`);
  }

  return response.json();
}

interface SearchConsoleRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function GET(request: NextRequest) {
  const supabase = createServerClient();

  try {
    // -----------------------------------------------------------------------
    // AUTH CHECK (same pattern as other admin routes)
    // -----------------------------------------------------------------------
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    let adminEmail: string | null = null;

    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      adminEmail = user?.email || null;
    }

    if (!adminEmail || !isAdmin(adminEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // -----------------------------------------------------------------------
    // PARSE PARAMS
    // -----------------------------------------------------------------------
    const { searchParams } = new URL(request.url);
    const site = searchParams.get('site') as 'pkf' | 'cpp' || 'pkf';
    const dateRange = searchParams.get('range') as '7d' | '28d' | '90d' || '28d';

    if (!SITES[site]) {
      return NextResponse.json({ error: 'Invalid site parameter' }, { status: 400 });
    }

    const days = DATE_RANGES[dateRange] || 28;
    // GSC data has ~3 day processing lag
    const startDate = getDateString(days + 3);
    const endDate = getDateString(3);

    // -----------------------------------------------------------------------
    // GET ACCESS TOKEN
    // -----------------------------------------------------------------------
    let accessToken: string;
    try {
      accessToken = await getAccessToken();
    } catch (error) {
      console.error('Google auth error:', error);
      return NextResponse.json({
        error: 'Google authentication failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        setup_hint: 'Ensure GOOGLE_SERVICE_ACCOUNT_KEY env var is set with valid service account JSON',
      }, { status: 500 });
    }

    // -----------------------------------------------------------------------
    // FETCH ALL DATA IN PARALLEL
    // -----------------------------------------------------------------------
    
    // Try domain property first, fall back to URL prefix
    const siteUrl = SITES[site];
    const siteUrlFallback = SITES_URL_PREFIX[site];

    // Test with a small query first to determine the right site URL
    let activeSiteUrl: string = siteUrl;
    let testResult = await querySearchConsole(
      accessToken, siteUrl, startDate, endDate, ['query'], 1
    );

    if (testResult === null) {
      // Try URL prefix format
      testResult = await querySearchConsole(
        accessToken, siteUrlFallback, startDate, endDate, ['query'], 1
      );
      if (testResult === null) {
        return NextResponse.json({
          error: `No access to Search Console for ${site === 'pkf' ? 'puttingkidsfirst.org' : 'claseparapadres.com'}`,
          details: 'The service account may not have access to this property. Add the service account email as a user in Google Search Console.',
        }, { status: 403 });
      }
      activeSiteUrl = siteUrlFallback;
    }

    // Now fetch all data in parallel
    const [queriesResult, pagesResult, deviceResult, dateResult] = await Promise.all([
      // Top queries
      querySearchConsole(accessToken, activeSiteUrl, startDate, endDate, ['query'], 25),
      // Top pages
      querySearchConsole(accessToken, activeSiteUrl, startDate, endDate, ['page'], 25),
      // Device breakdown
      querySearchConsole(accessToken, activeSiteUrl, startDate, endDate, ['device'], 5),
      // Date series (for trend chart)
      querySearchConsole(accessToken, activeSiteUrl, startDate, endDate, ['date'], 100),
    ]);

    // -----------------------------------------------------------------------
    // FORMAT RESPONSE
    // -----------------------------------------------------------------------
    
    // Calculate totals from date series (most accurate)
    const dateRows = dateResult?.rows || [];
    const totals = dateRows.reduce(
      (acc, row) => ({
        clicks: acc.clicks + row.clicks,
        impressions: acc.impressions + row.impressions,
        ctr: 0, // calculated below
        position: acc.position + (row.position * row.impressions), // weighted average
      }),
      { clicks: 0, impressions: 0, ctr: 0, position: 0 }
    );

    if (totals.impressions > 0) {
      totals.ctr = totals.clicks / totals.impressions;
      totals.position = totals.position / totals.impressions;
    }

    // Calculate comparison (first half vs second half of date range)
    const halfPoint = Math.floor(dateRows.length / 2);
    const firstHalf = dateRows.slice(0, halfPoint);
    const secondHalf = dateRows.slice(halfPoint);

    const firstHalfClicks = firstHalf.reduce((sum, r) => sum + r.clicks, 0);
    const secondHalfClicks = secondHalf.reduce((sum, r) => sum + r.clicks, 0);
    const clicksTrend = firstHalfClicks > 0
      ? Math.round(((secondHalfClicks - firstHalfClicks) / firstHalfClicks) * 100)
      : 0;

    const firstHalfImpressions = firstHalf.reduce((sum, r) => sum + r.impressions, 0);
    const secondHalfImpressions = secondHalf.reduce((sum, r) => sum + r.impressions, 0);
    const impressionsTrend = firstHalfImpressions > 0
      ? Math.round(((secondHalfImpressions - firstHalfImpressions) / firstHalfImpressions) * 100)
      : 0;

    // Format queries
    const queries = (queriesResult?.rows || []).map(row => ({
      query: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: Math.round(row.position * 10) / 10,
    }));

    // Format pages
    const pages = (pagesResult?.rows || []).map(row => ({
      page: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: Math.round(row.position * 10) / 10,
    }));

    // Format device data
    const devices = (deviceResult?.rows || []).map(row => ({
      device: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
    }));

    // Format date series
    const dateSeries = dateRows.map(row => ({
      date: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
    }));

    return NextResponse.json({
      site: site === 'pkf' ? 'puttingkidsfirst.org' : 'claseparapadres.com',
      dateRange,
      startDate,
      endDate,
      totals: {
        clicks: totals.clicks,
        impressions: totals.impressions,
        ctr: Math.round(totals.ctr * 1000) / 10, // percentage with 1 decimal
        position: Math.round(totals.position * 10) / 10,
      },
      trends: {
        clicks: clicksTrend,
        impressions: impressionsTrend,
      },
      queries,
      pages,
      devices,
      dateSeries,
      fetchedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Search analytics error:', error);
    return NextResponse.json({
      error: 'Failed to fetch search analytics',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
