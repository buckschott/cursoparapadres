// =============================================================================
// STUCK STUDENTS MODAL
// =============================================================================
// Path: /app/admin/support/components/modals/StuckStudentsModal.tsx
// =============================================================================

'use client';

import type { StuckStudent } from '../../types';
import { formatRelativeTime } from '../../utils';

interface StuckStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StuckStudent[];
  isLoading: boolean;
  onViewStudent: (email: string) => void;
  onEmailStudent: (email: string) => void;
}

export function StuckStudentsModal({
  isOpen,
  onClose,
  students,
  isLoading,
  onViewStudent,
  onEmailStudent,
}: StuckStudentsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[#2A2A2A] rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            ⚠️ Stuck Students ({students.length})
          </h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white p-2"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#77DD77]" />
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12 text-white/60">
              <p className="text-4xl mb-4">🎉</p>
              <p>No stuck students! Everyone is making progress.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="bg-[#1C1C1C] rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium text-white">
                        {student.full_name || 'No name'}
                      </span>
                      <span className="text-white/40 text-sm">
                        {student.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <span>
                        📚 {student.course_type === 'coparenting' ? 'Co-Parenting' : 'Parenting'}
                      </span>
                      <span>
                        📊 {student.lessons_completed}/15 lessons
                      </span>
                      <span className="text-[#FFE566]">
                        ⏰ {student.days_stuck} days stuck
                      </span>
                      {student.last_activity && (
                        <span>
                          Last active: {formatRelativeTime(student.last_activity)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewStudent(student.email)}
                      className="px-3 py-1.5 bg-[#7EC8E3] text-[#1C1C1C] rounded text-sm font-medium hover:bg-[#9DD8F3] transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onEmailStudent(student.email)}
                      className="px-3 py-1.5 bg-[#77DD77] text-[#1C1C1C] rounded text-sm font-medium hover:bg-[#88EE88] transition-colors"
                    >
                      Email
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#252525]">
          <p className="text-sm text-white/40">
            Students who purchased 7+ days ago but haven't completed all lessons
          </p>
        </div>
      </div>
    </div>
  );
}

export default StuckStudentsModal;
