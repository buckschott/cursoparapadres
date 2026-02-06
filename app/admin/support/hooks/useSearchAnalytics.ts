// =============================================================================
// SEARCH ANALYTICS HOOK
// =============================================================================
// Path: /app/admin/support/hooks/useSearchAnalytics.ts
// =============================================================================
//
// Dedicated hook for the SEO tab. Keeps search analytics state and logic
// separate from the main useAdminSupport hook.
// =============================================================================

'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import type {
  SearchAnalyticsSite,
  SearchAnalyticsDateRange,
  SearchAnalyticsData,
} from '../types';

// ============================================================================
// HOOK
// ============================================================================

export function useSearchAnalytics() {
  // -------------------------------------------------------------------------
  // STATE
  // -------------------------------------------------------------------------

  const [data, setData] = useState<SearchAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<SearchAnalyticsSite>('pkf');
  const [selectedRange, setSelectedRange] = useState<SearchAnalyticsDateRange>('28d');

  // -------------------------------------------------------------------------
  // AUTH HELPER (same pattern as useAdminSupport)
  // -------------------------------------------------------------------------

  const getAuthToken = useCallback(async (): Promise<string | null> => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }, []);

  // -------------------------------------------------------------------------
  // FETCH DATA
  // -------------------------------------------------------------------------

  const fetchAnalytics = useCallback(async (
    site?: SearchAnalyticsSite,
    range?: SearchAnalyticsDateRange,
  ) => {
    const activeSite = site || selectedSite;
    const activeRange = range || selectedRange;

    setIsLoading(true);
    setError(null);

    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const params = new URLSearchParams({
        site: activeSite,
        range: activeRange,
      });

      const response = await fetch(`/api/admin/support/search-analytics?${params}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.details || errorData.error || `API returned ${response.status}`
        );
      }

      const result: SearchAnalyticsData = await response.json();
      setData(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch analytics';
      setError(message);
      console.error('Search analytics error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [selectedSite, selectedRange, getAuthToken]);

  // -------------------------------------------------------------------------
  // SITE & RANGE CHANGERS (auto-fetch on change)
  // -------------------------------------------------------------------------

  const changeSite = useCallback((site: SearchAnalyticsSite) => {
    setSelectedSite(site);
    fetchAnalytics(site, selectedRange);
  }, [selectedRange, fetchAnalytics]);

  const changeRange = useCallback((range: SearchAnalyticsDateRange) => {
    setSelectedRange(range);
    fetchAnalytics(selectedSite, range);
  }, [selectedSite, fetchAnalytics]);

  // -------------------------------------------------------------------------
  // RETURN
  // -------------------------------------------------------------------------

  return {
    // Data
    data,
    isLoading,
    error,

    // Controls
    selectedSite,
    selectedRange,
    changeSite,
    changeRange,

    // Manual fetch
    fetchAnalytics,
  };
}

export default useSearchAnalytics;
