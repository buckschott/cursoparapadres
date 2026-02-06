// =============================================================================
// SEARCH ANALYTICS PANEL COMPONENT
// =============================================================================
// Path: /app/admin/support/components/SearchAnalyticsPanel.tsx
// =============================================================================
//
// The 📈 SEO tab — Google Search Console data for both PKF domains.
// Shows top queries, top pages, device breakdown, click trends, and key metrics.
// =============================================================================

'use client';

import React, { useEffect, useState } from 'react';
import { useSearchAnalytics } from '../hooks/useSearchAnalytics';
import type {
  SearchAnalyticsSite,
  SearchAnalyticsDateRange,
  SearchAnalyticsQuery,
  SearchAnalyticsPage,
} from '../types';

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/** Site selector toggle */
function SiteSelector({
  selected,
  onChange,
}: {
  selected: SearchAnalyticsSite;
  onChange: (site: SearchAnalyticsSite) => void;
}) {
  return (
    <div className="flex bg-white/5 rounded-lg p-1">
      <button
        onClick={() => onChange('pkf')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          selected === 'pkf'
            ? 'bg-[#77DD77] text-[#1C1C1C]'
            : 'text-white/60 hover:text-white'
        }`}
      >
        🇺🇸 puttingkidsfirst.org
      </button>
      <button
        onClick={() => onChange('cpp')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          selected === 'cpp'
            ? 'bg-[#77DD77] text-[#1C1C1C]'
            : 'text-white/60 hover:text-white'
        }`}
      >
        🇪🇸 claseparapadres.com
      </button>
    </div>
  );
}

/** Date range selector */
function RangeSelector({
  selected,
  onChange,
}: {
  selected: SearchAnalyticsDateRange;
  onChange: (range: SearchAnalyticsDateRange) => void;
}) {
  const ranges: { value: SearchAnalyticsDateRange; label: string }[] = [
    { value: '7d', label: '7 days' },
    { value: '28d', label: '28 days' },
    { value: '90d', label: '90 days' },
  ];

  return (
    <div className="flex bg-white/5 rounded-lg p-1">
      {ranges.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            selected === value
              ? 'bg-white/20 text-white'
              : 'text-white/40 hover:text-white/70'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/** Metric card for the top stats row */
function MetricCard({
  label,
  value,
  trend,
  icon,
}: {
  label: string;
  value: string;
  trend?: number;
  icon: string;
}) {
  const trendColor = trend === undefined
    ? ''
    : trend > 0
    ? 'text-[#77DD77]'
    : trend < 0
    ? 'text-[#FF9999]'
    : 'text-white/40';

  const trendArrow = trend === undefined
    ? ''
    : trend > 0
    ? '↑'
    : trend < 0
    ? '↓'
    : '→';

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-white/60">{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-white">{value}</span>
        {trend !== undefined && (
          <span className={`text-sm ${trendColor}`}>
            {trendArrow} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
}

/** Simple bar chart for click trends */
function ClickTrendChart({
  data,
}: {
  data: { date: string; clicks: number; impressions: number }[];
}) {
  if (data.length === 0) return null;

  const maxClicks = Math.max(...data.map(d => d.clicks), 1);

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <h3 className="text-sm font-medium text-white/80 mb-4">Click Trend</h3>
      <div className="flex items-end gap-[2px] h-32">
        {data.map((point, i) => {
          const height = (point.clicks / maxClicks) * 100;
          const dateObj = new Date(point.date + 'T00:00:00');
          const dayLabel = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

          return (
            <div
              key={point.date}
              className="flex-1 group relative"
              title={`${dayLabel}: ${point.clicks} clicks, ${point.impressions.toLocaleString()} impressions`}
            >
              <div
                className="bg-[#7EC8E3] hover:bg-[#77DD77] rounded-t-sm transition-colors w-full"
                style={{ height: `${Math.max(height, 2)}%` }}
              />
              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-[#2A2A2A] border border-white/20 rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-lg">
                  <div className="font-medium text-white">{dayLabel}</div>
                  <div className="text-[#7EC8E3]">{point.clicks} clicks</div>
                  <div className="text-white/50">{point.impressions.toLocaleString()} impr.</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2 text-[10px] text-white/30">
        <span>
          {data.length > 0
            ? new Date(data[0].date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : ''}
        </span>
        <span>
          {data.length > 0
            ? new Date(data[data.length - 1].date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : ''}
        </span>
      </div>
    </div>
  );
}

/** Device breakdown */
function DeviceBreakdown({
  devices,
}: {
  devices: { device: string; clicks: number; impressions: number; ctr: number }[];
}) {
  if (devices.length === 0) return null;

  const totalClicks = devices.reduce((sum, d) => sum + d.clicks, 0) || 1;

  const deviceIcons: Record<string, string> = {
    MOBILE: '📱',
    DESKTOP: '💻',
    TABLET: '📲',
  };

  const deviceColors: Record<string, string> = {
    MOBILE: 'bg-[#7EC8E3]',
    DESKTOP: 'bg-[#77DD77]',
    TABLET: 'bg-[#FFE566]',
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <h3 className="text-sm font-medium text-white/80 mb-4">Device Breakdown</h3>

      {/* Stacked bar */}
      <div className="flex rounded-full overflow-hidden h-3 mb-4">
        {devices.map(d => {
          const pct = (d.clicks / totalClicks) * 100;
          return (
            <div
              key={d.device}
              className={`${deviceColors[d.device] || 'bg-white/30'} transition-all`}
              style={{ width: `${pct}%` }}
              title={`${d.device}: ${Math.round(pct)}%`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {devices.map(d => {
          const pct = Math.round((d.clicks / totalClicks) * 100);
          return (
            <div key={d.device} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span>{deviceIcons[d.device] || '🔲'}</span>
                <span className="text-white/80 capitalize">{d.device.toLowerCase()}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-white/50 text-xs">{d.clicks.toLocaleString()} clicks</span>
                <span className="text-white font-medium w-12 text-right">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Sortable data table for queries or pages */
function DataTable({
  title,
  type,
  data,
}: {
  title: string;
  type: 'queries' | 'pages';
  data: (SearchAnalyticsQuery | SearchAnalyticsPage)[];
}) {
  const [sortBy, setSortBy] = useState<'clicks' | 'impressions' | 'ctr' | 'position'>('clicks');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  if (data.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <h3 className="text-sm font-medium text-white/80 mb-2">{title}</h3>
        <p className="text-white/40 text-sm">No data for this period.</p>
      </div>
    );
  }

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortDir(prev => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(column);
      // Position is better when lower, so default to ascending
      setSortDir(column === 'position' ? 'asc' : 'desc');
    }
  };

  const sorted = [...data].sort((a, b) => {
    const diff = a[sortBy] - b[sortBy];
    return sortDir === 'desc' ? -diff : diff;
  });

  const SortHeader = ({
    column,
    label,
    className = '',
  }: {
    column: typeof sortBy;
    label: string;
    className?: string;
  }) => (
    <th
      className={`text-left text-xs font-medium text-white/40 pb-2 cursor-pointer hover:text-white/70 select-none ${className}`}
      onClick={() => handleSort(column)}
    >
      {label}
      {sortBy === column && (
        <span className="ml-1">{sortDir === 'desc' ? '↓' : '↑'}</span>
      )}
    </th>
  );

  // For pages, strip the domain for readability
  const formatKey = (item: SearchAnalyticsQuery | SearchAnalyticsPage): string => {
    if (type === 'pages') {
      const page = (item as SearchAnalyticsPage).page;
      try {
        const url = new URL(page);
        return url.pathname || '/';
      } catch {
        return page;
      }
    }
    return (item as SearchAnalyticsQuery).query;
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <h3 className="text-sm font-medium text-white/80 mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-xs font-medium text-white/40 pb-2 w-[45%]">
                {type === 'queries' ? 'Query' : 'Page'}
              </th>
              <SortHeader column="clicks" label="Clicks" />
              <SortHeader column="impressions" label="Impr." />
              <SortHeader column="ctr" label="CTR" />
              <SortHeader column="position" label="Pos." />
            </tr>
          </thead>
          <tbody>
            {sorted.map((item, i) => {
              const key = formatKey(item);

              // Color-code position
              const posColor =
                item.position <= 3
                  ? 'text-[#77DD77]'
                  : item.position <= 10
                  ? 'text-[#7EC8E3]'
                  : item.position <= 20
                  ? 'text-[#FFE566]'
                  : 'text-white/50';

              return (
                <tr
                  key={`${key}-${i}`}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-2 pr-4">
                    <span
                      className="text-sm text-white/80 block truncate max-w-[300px]"
                      title={key}
                    >
                      {key}
                    </span>
                  </td>
                  <td className="py-2 text-sm text-white font-medium">
                    {item.clicks.toLocaleString()}
                  </td>
                  <td className="py-2 text-sm text-white/60">
                    {item.impressions.toLocaleString()}
                  </td>
                  <td className="py-2 text-sm text-white/60">
                    {(item.ctr * 100).toFixed(1)}%
                  </td>
                  <td className={`py-2 text-sm font-medium ${posColor}`}>
                    {item.position.toFixed(1)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SearchAnalyticsPanel() {
  const {
    data,
    isLoading,
    error,
    selectedSite,
    selectedRange,
    changeSite,
    changeRange,
    fetchAnalytics,
  } = useSearchAnalytics();

  // Initial load
  const [hasLoaded, setHasLoaded] = useState(false);
  useEffect(() => {
    if (!hasLoaded) {
      fetchAnalytics();
      setHasLoaded(true);
    }
  }, [hasLoaded, fetchAnalytics]);

  // -------------------------------------------------------------------------
  // LOADING STATE
  // -------------------------------------------------------------------------

  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SiteSelector selected={selectedSite} onChange={changeSite} />
          <RangeSelector selected={selectedRange} onChange={changeRange} />
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#77DD77] mx-auto mb-4" />
            <p className="text-white/60 text-sm">Fetching Search Console data...</p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // ERROR STATE
  // -------------------------------------------------------------------------

  if (error && !data) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SiteSelector selected={selectedSite} onChange={changeSite} />
          <RangeSelector selected={selectedRange} onChange={changeRange} />
        </div>
        <div className="bg-[#FF9999]/10 border border-[#FF9999]/30 rounded-xl p-6">
          <h3 className="text-[#FF9999] font-medium mb-2">⚠️ Search Console Error</h3>
          <p className="text-white/70 text-sm mb-4">{error}</p>
          <div className="bg-white/5 rounded-lg p-4 text-sm text-white/60 space-y-2">
            <p className="font-medium text-white/80">Troubleshooting checklist:</p>
            <p>1. <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">GOOGLE_SERVICE_ACCOUNT_KEY</code> env var is set in Vercel</p>
            <p>2. The value is the full JSON content of the service account key file</p>
            <p>3. The service account email is added as a <strong>user</strong> (not owner) with <strong>Full</strong> access in Google Search Console</p>
            <p>4. Both properties (puttingkidsfirst.org and claseparapadres.com) have the service account added</p>
            <p>5. The Search Console API is enabled in Google Cloud Console</p>
          </div>
          <button
            onClick={() => fetchAnalytics()}
            className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-colors"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Controls row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SiteSelector selected={selectedSite} onChange={changeSite} />
        <div className="flex items-center gap-3">
          <RangeSelector selected={selectedRange} onChange={changeRange} />
          <button
            onClick={() => fetchAnalytics()}
            disabled={isLoading}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <svg
              className={`w-4 h-4 text-white/60 ${isLoading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Date range label */}
      {data && (
        <div className="text-xs text-white/40">
          {data.startDate} → {data.endDate} · {data.site}
          {data.fetchedAt && (
            <span className="ml-2">
              · Updated {new Date(data.fetchedAt).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </span>
          )}
        </div>
      )}

      {/* Top metrics */}
      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Clicks"
            value={data.totals.clicks.toLocaleString()}
            trend={data.trends.clicks}
            icon="👆"
          />
          <MetricCard
            label="Total Impressions"
            value={data.totals.impressions.toLocaleString()}
            trend={data.trends.impressions}
            icon="👁️"
          />
          <MetricCard
            label="Avg. CTR"
            value={`${data.totals.ctr}%`}
            icon="🎯"
          />
          <MetricCard
            label="Avg. Position"
            value={data.totals.position.toFixed(1)}
            icon="📍"
          />
        </div>
      )}

      {/* Trend chart + device breakdown side by side */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ClickTrendChart data={data.dateSeries} />
          </div>
          <div>
            <DeviceBreakdown devices={data.devices} />
          </div>
        </div>
      )}

      {/* Data tables side by side on large screens */}
      {data && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <DataTable
            title="Top Queries"
            type="queries"
            data={data.queries}
          />
          <DataTable
            title="Top Pages"
            type="pages"
            data={data.pages}
          />
        </div>
      )}
    </div>
  );
}
