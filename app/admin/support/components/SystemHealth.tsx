// =============================================================================
// SYSTEM HEALTH COMPONENT
// =============================================================================
// Path: /app/admin/support/components/SystemHealth.tsx
// =============================================================================

'use client';

import React from 'react';
import type { SystemHealth as SystemHealthType } from '../types';
import { formatRelativeTime } from '../utils';

// ============================================================================
// TYPES
// ============================================================================

interface SystemHealthProps {
  health: SystemHealthType;
  isLoading: boolean;
  onRefresh: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * SystemHealth - Displays service status indicators for Supabase, Stripe, Resend.
 */
export default function SystemHealth({ health, isLoading, onRefresh }: SystemHealthProps) {
  const getStatusColor = (status: 'healthy' | 'degraded' | 'down') => {
    switch (status) {
      case 'healthy':
        return 'bg-[#77DD77]';
      case 'degraded':
        return 'bg-[#FFE566]';
      case 'down':
        return 'bg-[#FF9999]';
    }
  };

  const getStatusLabel = (status: 'healthy' | 'degraded' | 'down') => {
    switch (status) {
      case 'healthy':
        return 'Healthy';
      case 'degraded':
        return 'Degraded';
      case 'down':
        return 'Down';
    }
  };

  const services = [
    { name: 'Supabase', status: health.supabase, icon: '🗄️' },
    { name: 'Stripe', status: health.stripe, icon: '💳' },
    { name: 'Resend', status: health.resend, icon: '📧' },
  ];

  const allHealthy = services.every(s => s.status === 'healthy');

  return (
    <div className={`
      rounded-xl p-4 border
      ${allHealthy 
        ? 'bg-white/5 border-white/10' 
        : 'bg-[#FFE566]/10 border-[#FFE566]/30'}
    `}>
      {/* Top row: label + refresh */}
      <div className="flex items-center justify-between mb-3 sm:mb-0">
        <span className="text-sm text-white/60">System Status:</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/40">
            {formatRelativeTime(health.lastCheck)}
          </span>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh status"
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

      {/* Services row: wraps on mobile */}
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {services.map((service) => (
          <div key={service.name} className="flex items-center gap-2">
            <span className="text-sm">{service.icon}</span>
            <span className="text-sm text-white/80">{service.name}</span>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(service.status)}`} />
              <span className={`text-xs ${
                service.status === 'healthy' 
                  ? 'text-white/40' 
                  : service.status === 'degraded'
                  ? 'text-[#FFE566]'
                  : 'text-[#FF9999]'
              }`}>
                {getStatusLabel(service.status)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
