// =============================================================================
// PURCHASES SECTION COMPONENT
// =============================================================================
// Path: /app/admin/support/components/PurchasesSection.tsx
// =============================================================================

'use client';

import React, { useState } from 'react';
import type { Purchase, CourseProgress, ExamAttempt, Certificate } from '../types';
import { 
  formatDate, 
  formatCurrency, 
  getCourseDisplayName,
  getSwapTargetCourse,
  checkSwapEligibility,
  getStripePaymentUrl,
} from '../utils';
import { StatusBadge, ActionButton, ConfirmButton } from './ui';

// ============================================================================
// TYPES
// ============================================================================

interface PurchasesSectionProps {
  purchases: Purchase[];
  courseProgress: CourseProgress[];
  examAttempts: ExamAttempt[];
  certificates: Certificate[];
  onSwapClass: (purchaseId: string, targetCourse: string) => void;
  onResendWelcome: (courseType: string) => void;
  isExecutingAction: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * PurchasesSection - Displays customer's purchases with swap and management options.
 */
export default function PurchasesSection({
  purchases,
  courseProgress,
  examAttempts,
  certificates,
  onSwapClass,
  onResendWelcome,
  isExecutingAction,
}: PurchasesSectionProps) {
  const [expandedPurchase, setExpandedPurchase] = useState<string | null>(null);

  if (purchases.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">💳 Purchases</h3>
        <p className="text-white/60">No purchases found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10">
        <h3 className="text-lg font-bold text-white">💳 Purchases</h3>
      </div>

      <div className="divide-y divide-white/10">
        {purchases.map((purchase) => {
          const progress = courseProgress.find(p => p.course_type === purchase.course_type);
          const hasPassedExam = examAttempts.some(
            e => e.passed && (purchase.course_type === 'bundle' || e.purchase_id === purchase.id)
          );
          const hasCertificate = certificates.some(
            c => c.course_type === purchase.course_type || purchase.course_type === 'bundle'
          );
          const targetCourse = getSwapTargetCourse(purchase.course_type);
          const ownsTargetClass = targetCourse 
            ? purchases.some(p => p.course_type === targetCourse || p.course_type === 'bundle')
            : false;
          
          const swapEligibility = checkSwapEligibility(
            purchase,
            progress || null,
            hasPassedExam,
            hasCertificate,
            ownsTargetClass
          );

          const isExpanded = expandedPurchase === purchase.id;

          return (
            <div key={purchase.id} className="p-6">
              {/* Main Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                    {purchase.course_type === 'coparenting' && '👨‍👩‍👧'}
                    {purchase.course_type === 'parenting' && '👪'}
                    {purchase.course_type === 'bundle' && '📦'}
                  </div>
                  <div>
                    <h4 className="font-medium text-white">
                      {getCourseDisplayName(purchase.course_type)}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <span>{formatDate(purchase.purchased_at)}</span>
                      <span>•</span>
                      <span>{formatCurrency(purchase.amount_paid)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {purchase.status === 'active' ? (
                    <StatusBadge status="success">Active</StatusBadge>
                  ) : (
                    <StatusBadge status="error">Refunded</StatusBadge>
                  )}
                  
                  {swapEligibility.eligible && (
                    <StatusBadge status="info">🔄 Swap Available</StatusBadge>
                  )}

                  <button
                    onClick={() => setExpandedPurchase(isExpanded ? null : purchase.id)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
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
                      <span className="text-white/40 block">Purchase ID</span>
                      <span className="text-white/70 font-mono text-xs">{purchase.id.slice(0, 8)}...</span>
                    </div>
                    <div>
                      <span className="text-white/40 block">Stripe Payment</span>
                      {purchase.stripe_payment_id ? (
                        <a
                          href={getStripePaymentUrl(purchase.stripe_payment_id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#7EC8E3] hover:underline text-xs"
                        >
                          View in Stripe →
                        </a>
                      ) : (
                        <span className="text-white/40">—</span>
                      )}
                    </div>
                    <div>
                      <span className="text-white/40 block">Exam Version</span>
                      <span className="text-white/70">{purchase.exam_version || 'Not assigned'}</span>
                    </div>
                    <div>
                      <span className="text-white/40 block">Swap Used</span>
                      <span className="text-white/70">{purchase.has_swapped ? 'Yes' : 'No'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    <ActionButton
                      onClick={() => onResendWelcome(purchase.course_type)}
                      disabled={isExecutingAction || purchase.status !== 'active'}
                    >
                      📧 Resend Welcome Email
                    </ActionButton>

                    {swapEligibility.eligible && targetCourse && (
                      <ConfirmButton
                        onClick={() => onSwapClass(purchase.id, targetCourse)}
                        disabled={isExecutingAction}
                        confirmText={`⚠️ Swap to ${getCourseDisplayName(targetCourse)}?`}
                      >
                        🔄 Swap to {getCourseDisplayName(targetCourse)}
                      </ConfirmButton>
                    )}

                    {!swapEligibility.eligible && purchase.course_type !== 'bundle' && (
                      <div className="text-xs text-white/40 self-center">
                        Swap unavailable: {swapEligibility.reason}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
