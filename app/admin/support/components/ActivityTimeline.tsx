// =============================================================================
// ACTIVITY TIMELINE COMPONENT
// =============================================================================
// Path: /app/admin/support/components/ActivityTimeline.tsx
// =============================================================================

'use client';

import React, { useState, useMemo } from 'react';
import type { CustomerData, TimelineEvent } from '../types';
import { formatDate, formatRelativeTime, getCourseDisplayName } from '../utils';

// ============================================================================
// TYPES
// ============================================================================

interface ActivityTimelineProps {
  customer: CustomerData;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ActivityTimeline - Displays a chronological view of all customer events.
 */
export default function ActivityTimeline({ customer }: ActivityTimelineProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Build timeline from customer data
  const timeline = useMemo(() => {
    return buildTimeline(customer);
  }, [customer]);

  if (timeline.length === 0) {
    return null;
  }

  const displayedEvents = isExpanded ? timeline : timeline.slice(0, 5);
  const hasMore = timeline.length > 5;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">📅 Activity Timeline</h3>
        <span className="text-sm text-white/40">{timeline.length} events</span>
      </div>

      <div className="p-6">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/10" />

          {/* Events */}
          <div className="space-y-4">
            {displayedEvents.map((event, index) => (
              <TimelineItem 
                key={event.id} 
                event={event} 
                isFirst={index === 0}
                isLast={index === displayedEvents.length - 1 && !hasMore}
              />
            ))}
          </div>

          {/* Show more button */}
          {hasMore && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-4 ml-10 text-sm text-[#7EC8E3] hover:underline"
            >
              {isExpanded 
                ? 'Show less' 
                : `Show ${timeline.length - 5} more events`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TIMELINE ITEM
// ============================================================================

interface TimelineItemProps {
  event: TimelineEvent;
  isFirst: boolean;
  isLast: boolean;
}

function TimelineItem({ event, isFirst }: TimelineItemProps) {
  const iconConfig = getEventIcon(event.type);

  return (
    <div className="flex gap-4 relative">
      {/* Icon */}
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center z-10
        ${iconConfig.bgColor}
      `}>
        <span className="text-sm">{iconConfig.icon}</span>
      </div>

      {/* Content */}
      <div className={`flex-1 pb-4 ${isFirst ? '' : ''}`}>
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-sm font-medium text-white">{event.title}</h4>
            {event.details && (
              <p className="text-xs text-white/60 mt-0.5">{event.details}</p>
            )}
          </div>
          <div className="text-xs text-white/40 whitespace-nowrap ml-4">
            {formatRelativeTime(event.timestamp)}
          </div>
        </div>
        <div className="text-xs text-white/30 mt-1">
          {formatDate(event.timestamp)}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function getEventIcon(type: TimelineEvent['type']): { icon: string; bgColor: string } {
  switch (type) {
    case 'purchase':
      return { icon: '💳', bgColor: 'bg-[#77DD77]/20' };
    case 'lesson_complete':
      return { icon: '📖', bgColor: 'bg-[#7EC8E3]/20' };
    case 'exam_attempt':
      return { icon: '📝', bgColor: 'bg-[#FFE566]/20' };
    case 'exam_passed':
      return { icon: '✅', bgColor: 'bg-[#77DD77]/20' };
    case 'certificate_issued':
      return { icon: '🏆', bgColor: 'bg-[#77DD77]/20' };
    case 'profile_updated':
      return { icon: '👤', bgColor: 'bg-[#B19CD9]/20' };
    case 'login':
      return { icon: '🔐', bgColor: 'bg-white/10' };
    case 'support_email':
      return { icon: '📧', bgColor: 'bg-[#7EC8E3]/20' };
    default:
      return { icon: '•', bgColor: 'bg-white/10' };
  }
}

function buildTimeline(customer: CustomerData): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const { profile, authUser, purchases, courseProgress, examAttempts, certificates } = customer;

  // Account creation
  if (profile?.created_at) {
    events.push({
      id: 'account-created',
      type: 'profile_updated',
      timestamp: profile.created_at,
      title: 'Account created',
      details: profile.email,
    });
  }

  // Purchases
  purchases.forEach((purchase) => {
    events.push({
      id: `purchase-${purchase.id}`,
      type: 'purchase',
      timestamp: purchase.purchased_at,
      title: `Purchased ${getCourseDisplayName(purchase.course_type)}`,
      details: purchase.status === 'refunded' ? 'Later refunded' : undefined,
    });
  });

  // Course starts
  courseProgress.forEach((progress) => {
    if (progress.started_at) {
      events.push({
        id: `course-start-${progress.id}`,
        type: 'lesson_complete',
        timestamp: progress.started_at,
        title: `Started ${getCourseDisplayName(progress.course_type)}`,
      });
    }
  });

  // Exam attempts
  examAttempts.forEach((attempt) => {
    if (attempt.started_at) {
      events.push({
        id: `exam-start-${attempt.id}`,
        type: 'exam_attempt',
        timestamp: attempt.started_at,
        title: 'Started exam attempt',
        details: `Version ${attempt.version}`,
      });
    }
    if (attempt.completed_at) {
      events.push({
        id: `exam-complete-${attempt.id}`,
        type: attempt.passed ? 'exam_passed' : 'exam_attempt',
        timestamp: attempt.completed_at,
        title: attempt.passed 
          ? `Passed exam with ${attempt.score}/20` 
          : `Failed exam with ${attempt.score}/20`,
      });
    }
  });

  // Certificates
  certificates.forEach((cert) => {
    events.push({
      id: `cert-${cert.id}`,
      type: 'certificate_issued',
      timestamp: cert.issued_at,
      title: `Certificate issued for ${getCourseDisplayName(cert.course_type)}`,
      details: cert.certificate_number,
    });
  });

  // Last login
  if (authUser?.last_sign_in_at) {
    events.push({
      id: 'last-login',
      type: 'login',
      timestamp: authUser.last_sign_in_at,
      title: 'Last sign in',
    });
  }

  // Sort by timestamp descending (most recent first)
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return events;
}
