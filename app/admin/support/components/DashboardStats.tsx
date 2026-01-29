// =============================================================================
// DASHBOARD STATS COMPONENT
// =============================================================================
// Path: /app/admin/support/components/DashboardStats.tsx
// =============================================================================

'use client';

import React from 'react';
import type { DashboardStats as DashboardStatsType } from '../types';
import { StatCard, StatCardGrid, AlertStatCard } from './ui';

// ============================================================================
// TYPES
// ============================================================================

interface DashboardStatsProps {
  stats: DashboardStatsType;
  isLoading: boolean;
  onStuckStudentsClick: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * DashboardStats - Displays key metrics and alerts.
 */
export default function DashboardStats({ 
  stats, 
  isLoading, 
  onStuckStudentsClick 
}: DashboardStatsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <StatCardGrid>
          {[...Array(4)].map((_, i) => (
            <div 
              key={i} 
              className="bg-white/5 border border-white/10 rounded-xl p-4 animate-pulse"
            >
              <div className="h-4 w-24 bg-white/10 rounded mb-2" />
              <div className="h-8 w-16 bg-white/10 rounded" />
            </div>
          ))}
        </StatCardGrid>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Primary Stats */}
      <StatCardGrid>
        <StatCard
          label="Total Customers"
          value={stats.totalCustomers.toLocaleString()}
          icon="👤"
        />
        <StatCard
          label="Graduates"
          value={stats.totalGraduates.toLocaleString()}
          icon="🎓"
          subValue={`${stats.completionRate}% completion rate`}
        />
        <StatCard
          label="Attorney Referrals"
          value={`${stats.attorneyRate}%`}
          icon="⚖️"
          subValue="of graduates"
        />
        <StatCard
          label="Avg Days to Complete"
          value={stats.avgDaysToComplete}
          icon="📅"
        />
      </StatCardGrid>

      {/* Course Breakdown & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Course Breakdown */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h3 className="text-sm text-white/60 mb-3">Course Breakdown</h3>
          <div className="space-y-2">
            <CourseBar 
              label="Co-Parenting" 
              count={stats.courseBreakdown.coparenting}
              total={stats.totalCustomers}
              color="#7EC8E3"
            />
            <CourseBar 
              label="Parenting" 
              count={stats.courseBreakdown.parenting}
              total={stats.totalCustomers}
              color="#77DD77"
            />
            <CourseBar 
              label="Bundle" 
              count={stats.courseBreakdown.bundle}
              total={stats.totalCustomers}
              color="#B19CD9"
            />
          </div>
        </div>

        {/* Exam Stats */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h3 className="text-sm text-white/60 mb-3">Exam Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/70">Pass Rate</span>
              <span className="text-lg font-bold text-[#77DD77]">
                {stats.examStats.passRate}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/70">First Attempt Pass</span>
              <span className="text-lg font-bold text-white">
                {stats.examStats.firstAttemptPassRate}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/70">Total Attempts</span>
              <span className="text-sm text-white/60">
                {stats.examStats.totalAttempts.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="space-y-3">
          {stats.stuckStudents > 0 ? (
            <AlertStatCard
              label="Stuck Students"
              value={stats.stuckStudents}
              severity="warning"
              onClick={onStuckStudentsClick}
            />
          ) : (
            <div className="bg-[#77DD77]/10 border border-[#77DD77]/30 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <span>🎉</span>
                <span className="text-sm text-[#77DD77]">No stuck students!</span>
              </div>
            </div>
          )}
          
          {/* Recent Activity */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-sm text-white/60 mb-2">Last 7 Days</h3>
            <div className="flex gap-4">
              <div>
                <span className="text-lg font-bold text-white">
                  {stats.recentActivity.purchases}
                </span>
                <span className="text-xs text-white/40 ml-1">purchases</span>
              </div>
              <div>
                <span className="text-lg font-bold text-[#77DD77]">
                  {stats.recentActivity.graduates}
                </span>
                <span className="text-xs text-white/40 ml-1">graduates</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top States */}
      {stats.topStates.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h3 className="text-sm text-white/60 mb-3">Top States</h3>
          <div className="flex flex-wrap gap-2">
            {stats.topStates.map((state) => (
              <span 
                key={state.state}
                className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/80"
              >
                {state.state}: {state.count}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COURSE BAR SUB-COMPONENT
// ============================================================================

interface CourseBarProps {
  label: string;
  count: number;
  total: number;
  color: string;
}

function CourseBar({ label, count, total, color }: CourseBarProps) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-white/70">{label}</span>
        <span className="text-white/60">{count.toLocaleString()}</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
