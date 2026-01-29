// =============================================================================
// PROGRESS SECTION COMPONENT
// =============================================================================
// Path: /app/admin/support/components/ProgressSection.tsx
// =============================================================================

'use client';

import React from 'react';
import type { CourseProgress, ExamAttempt, Certificate, Purchase } from '../types';
import { 
  formatDate, 
  formatRelativeTime,
  getCourseDisplayName,
  calculateProgress,
  getAllLessons,
} from '../utils';
import { StatusBadge, ConfirmButton } from './ui';

// ============================================================================
// TYPES
// ============================================================================

interface ProgressSectionProps {
  purchases: Purchase[];
  courseProgress: CourseProgress[];
  examAttempts: ExamAttempt[];
  certificates: Certificate[];
  onResetProgress: (courseType: string) => void;
  isExecutingAction: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ProgressSection - Displays course progress for each enrolled course.
 */
export default function ProgressSection({
  purchases,
  courseProgress,
  examAttempts,
  certificates,
  onResetProgress,
  isExecutingAction,
}: ProgressSectionProps) {
  // Determine which courses the user has access to
  const accessibleCourses: string[] = [];
  purchases.forEach(p => {
    if (p.status === 'active') {
      if (p.course_type === 'bundle') {
        accessibleCourses.push('coparenting', 'parenting');
      } else {
        accessibleCourses.push(p.course_type);
      }
    }
  });
  const uniqueCourses = [...new Set(accessibleCourses)];

  if (uniqueCourses.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10">
        <h3 className="text-lg font-bold text-white">📊 Course Progress</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {uniqueCourses.map((courseType) => {
          const progress = courseProgress.find(p => p.course_type === courseType);
          const passedExam = examAttempts.find(e => e.passed);
          const certificate = certificates.find(c => c.course_type === courseType);
          
          const lessonsCompleted = progress?.lessons_completed || [];
          const totalLessons = 15;
          const percentComplete = calculateProgress(lessonsCompleted.length, totalLessons);
          const allLessons = getAllLessons();

          return (
            <div 
              key={courseType}
              className="bg-white/5 border border-white/10 rounded-xl p-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-white">
                  {getCourseDisplayName(courseType)}
                </h4>
                <CourseStatusBadge
                  lessonsCompleted={lessonsCompleted.length}
                  examPassed={!!passedExam}
                  hasCertificate={!!certificate}
                />
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/60">Lessons</span>
                  <span className="text-white/80">{lessonsCompleted.length}/{totalLessons}</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#7EC8E3] rounded-full transition-all duration-500"
                    style={{ width: `${percentComplete}%` }}
                  />
                </div>
              </div>

              {/* Lesson Grid */}
              <div className="mb-4">
                <span className="text-xs text-white/40 block mb-2">Completed lessons:</span>
                <div className="flex flex-wrap gap-1">
                  {allLessons.map((lesson) => (
                    <div
                      key={lesson}
                      className={`
                        w-6 h-6 rounded text-xs flex items-center justify-center
                        ${lessonsCompleted.includes(lesson)
                          ? 'bg-[#77DD77]/30 text-[#77DD77]'
                          : 'bg-white/10 text-white/30'}
                      `}
                    >
                      {lesson}
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-white/40 block">Started</span>
                  <span className="text-white/70">{formatDate(progress?.started_at)}</span>
                </div>
                <div>
                  <span className="text-white/40 block">Last Activity</span>
                  <span className="text-white/70">{formatRelativeTime(progress?.last_accessed)}</span>
                </div>
                {progress?.completed_at && (
                  <div className="col-span-2">
                    <span className="text-white/40 block">Completed</span>
                    <span className="text-[#77DD77]">{formatDate(progress.completed_at)}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-white/10">
                <ConfirmButton
                  onClick={() => onResetProgress(courseType)}
                  disabled={isExecutingAction || lessonsCompleted.length === 0}
                  confirmText="⚠️ Reset all progress?"
                >
                  🔄 Reset Progress
                </ConfirmButton>
                {lessonsCompleted.length === 0 && (
                  <span className="text-xs text-white/40 ml-3">No progress to reset</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// COURSE STATUS BADGE
// ============================================================================

interface CourseStatusBadgeProps {
  lessonsCompleted: number;
  examPassed: boolean;
  hasCertificate: boolean;
}

function CourseStatusBadge({ lessonsCompleted, examPassed, hasCertificate }: CourseStatusBadgeProps) {
  if (hasCertificate) {
    return <StatusBadge status="success">✅ Certificate Issued</StatusBadge>;
  }
  if (examPassed) {
    return <StatusBadge status="info">🏆 Exam Passed</StatusBadge>;
  }
  if (lessonsCompleted === 15) {
    return <StatusBadge status="info">📝 Ready for Exam</StatusBadge>;
  }
  if (lessonsCompleted > 0) {
    return <StatusBadge status="warning">🔄 In Progress</StatusBadge>;
  }
  return <StatusBadge status="warning">⏳ Not Started</StatusBadge>;
}
