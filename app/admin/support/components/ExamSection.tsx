// =============================================================================
// EXAM SECTION COMPONENT
// =============================================================================
// Path: /app/admin/support/components/ExamSection.tsx
// =============================================================================

'use client';

import React, { useState } from 'react';
import type { ExamAttempt } from '../types';
import { formatDate, getCourseDisplayName } from '../utils';
import { StatusBadge, ConfirmButton } from './ui';

// ============================================================================
// TYPES
// ============================================================================

interface ExamSectionProps {
  examAttempts: ExamAttempt[];
  onDeleteAttempts: (courseType: string) => void;
  isExecutingAction: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ExamSection - Displays exam attempts with expandable details.
 */
export default function ExamSection({
  examAttempts,
  onDeleteAttempts,
  isExecutingAction,
}: ExamSectionProps) {
  const [expandedAttempt, setExpandedAttempt] = useState<string | null>(null);

  if (examAttempts.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">📝 Exam Attempts</h3>
        <p className="text-white/60">No exam attempts yet.</p>
      </div>
    );
  }

  // Group attempts by course type
  const attemptsByCourse = examAttempts.reduce((acc, attempt) => {
    // Determine course type from attempt (would need to be added to the type)
    const courseType = 'coparenting'; // Default for now - in real implementation, get from attempt
    if (!acc[courseType]) {
      acc[courseType] = [];
    }
    acc[courseType].push(attempt);
    return acc;
  }, {} as Record<string, ExamAttempt[]>);

  // Calculate stats
  const totalAttempts = examAttempts.length;
  const passedAttempts = examAttempts.filter(a => a.passed).length;
  const failedAttempts = examAttempts.filter(a => a.completed_at && !a.passed).length;
  const inProgressAttempts = examAttempts.filter(a => !a.completed_at).length;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">📝 Exam Attempts</h3>
        <div className="flex gap-3 text-sm">
          <span className="text-white/60">
            Total: <span className="text-white">{totalAttempts}</span>
          </span>
          {passedAttempts > 0 && (
            <span className="text-[#77DD77]">
              ✅ {passedAttempts} passed
            </span>
          )}
          {failedAttempts > 0 && (
            <span className="text-[#FF9999]">
              ❌ {failedAttempts} failed
            </span>
          )}
          {inProgressAttempts > 0 && (
            <span className="text-[#FFE566]">
              ⏳ {inProgressAttempts} in progress
            </span>
          )}
        </div>
      </div>

      <div className="divide-y divide-white/10">
        {examAttempts.map((attempt, index) => {
          const isExpanded = expandedAttempt === attempt.id;
          const attemptNumber = examAttempts.length - index;

          return (
            <div key={attempt.id} className="p-6">
              {/* Main Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center text-lg
                    ${attempt.passed 
                      ? 'bg-[#77DD77]/20' 
                      : attempt.completed_at 
                      ? 'bg-[#FF9999]/20'
                      : 'bg-[#FFE566]/20'}
                  `}>
                    {attempt.passed ? '✅' : attempt.completed_at ? '❌' : '⏳'}
                  </div>
                  <div>
                    <h4 className="font-medium text-white">
                      Attempt #{attemptNumber}
                      <span className="text-white/40 font-normal ml-2">
                        (Version {attempt.version})
                      </span>
                    </h4>
                    <div className="text-sm text-white/60">
                      {attempt.completed_at 
                        ? formatDate(attempt.completed_at)
                        : `Started ${formatDate(attempt.started_at)}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {attempt.score !== null && (
                    <span className={`text-lg font-bold ${
                      attempt.passed ? 'text-[#77DD77]' : 'text-[#FF9999]'
                    }`}>
                      {attempt.score}/20
                    </span>
                  )}
                  
                  <ExamResultBadge attempt={attempt} />

                  <button
                    onClick={() => setExpandedAttempt(isExpanded ? null : attempt.id)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="View details"
                  >
                    <svg 
                      className={`w-5 h-5 text-white/60 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-white/40 block">Attempt ID</span>
                      <span className="text-white/70 font-mono text-xs">{attempt.id.slice(0, 8)}...</span>
                    </div>
                    <div>
                      <span className="text-white/40 block">Version</span>
                      <span className="text-white/70">{attempt.version}</span>
                    </div>
                    <div>
                      <span className="text-white/40 block">Questions Shown</span>
                      <span className="text-white/70">{attempt.questions_shown?.length || 0}</span>
                    </div>
                    <div>
                      <span className="text-white/40 block">Duration</span>
                      <span className="text-white/70">
                        {attempt.started_at && attempt.completed_at
                          ? calculateDuration(attempt.started_at, attempt.completed_at)
                          : 'In progress'}
                      </span>
                    </div>
                  </div>

                  {/* Questions Detail (if available) */}
                  {attempt.questions_shown && attempt.questions_shown.length > 0 && (
                    <div className="mt-4">
                      <span className="text-xs text-white/40 block mb-2">Questions in this exam:</span>
                      <div className="flex flex-wrap gap-1">
                        {attempt.questions_shown.map((qId, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-1 bg-white/10 rounded text-xs text-white/60 font-mono"
                          >
                            {qId}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Answers Detail (if available and failed) */}
                  {!attempt.passed && attempt.answers_given && (
                    <div className="mt-4 p-3 bg-[#FF9999]/10 border border-[#FF9999]/20 rounded-lg">
                      <span className="text-xs text-[#FF9999] block mb-2">
                        ❌ Review needed - user may benefit from support outreach
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions Footer */}
      <div className="px-6 py-4 border-t border-white/10 bg-white/5">
        <div className="flex items-center gap-4">
          <ConfirmButton
            onClick={() => onDeleteAttempts('coparenting')}
            disabled={isExecutingAction || examAttempts.length === 0}
            confirmText="⚠️ Delete ALL exam attempts?"
          >
            🗑️ Clear All Attempts
          </ConfirmButton>
          <span className="text-xs text-white/40">
            This allows the user to retake the exam fresh
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EXAM RESULT BADGE
// ============================================================================

function ExamResultBadge({ attempt }: { attempt: ExamAttempt }) {
  if (attempt.passed) {
    return <StatusBadge status="success">✅ Passed</StatusBadge>;
  }
  if (attempt.completed_at) {
    return <StatusBadge status="error">❌ Failed</StatusBadge>;
  }
  return <StatusBadge status="warning">⏳ In Progress</StatusBadge>;
}

// ============================================================================
// HELPER
// ============================================================================

function calculateDuration(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 60) {
    return `${diffMins} min`;
  }
  
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return `${hours}h ${mins}m`;
}
