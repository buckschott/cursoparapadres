// =============================================================================
// ACTION LOG COMPONENT
// =============================================================================
// Path: /app/admin/support/components/ActionLog.tsx
// =============================================================================

'use client';

import React, { useState } from 'react';
import type { ActionLog as ActionLogType } from '../types';
import { formatRelativeTime } from '../utils';

// ============================================================================
// TYPES
// ============================================================================

interface ActionLogProps {
  actions: ActionLogType[];
  onClear: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ActionLog - Displays a log of actions taken during this admin session.
 */
export default function ActionLog({ actions, onClear }: ActionLogProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (actions.length === 0) {
    return null;
  }

  const displayedActions = isExpanded ? actions : actions.slice(0, 5);

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-white">📋 Session Action Log</h3>
          <span className="text-xs text-white/40 bg-white/10 px-2 py-1 rounded-full">
            {actions.length} action{actions.length !== 1 ? 's' : ''}
          </span>
        </div>
        <button
          onClick={onClear}
          className="text-xs text-white/40 hover:text-white/60 transition-colors"
        >
          Clear log
        </button>
      </div>

      <div className="divide-y divide-white/5">
        {displayedActions.map((action) => (
          <ActionLogItem key={action.id} action={action} />
        ))}
      </div>

      {actions.length > 5 && (
        <div className="px-6 py-3 border-t border-white/10">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-[#7EC8E3] hover:underline"
          >
            {isExpanded 
              ? 'Show less' 
              : `Show ${actions.length - 5} more actions`}
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ACTION LOG ITEM
// ============================================================================

function ActionLogItem({ action }: { action: ActionLogType }) {
  const icon = getActionIcon(action.action);

  return (
    <div className="px-6 py-3 flex items-center gap-4">
      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
        <span className="text-sm">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{action.action}</span>
          <span className="text-xs text-white/40">→</span>
          <span className="text-sm text-[#7EC8E3] truncate">{action.target_user}</span>
        </div>
        <p className="text-xs text-white/40 truncate">{action.details}</p>
      </div>
      <div className="text-xs text-white/30 whitespace-nowrap">
        {formatRelativeTime(action.timestamp)}
      </div>
    </div>
  );
}

// ============================================================================
// HELPER
// ============================================================================

function getActionIcon(action: string): string {
  const actionLower = action.toLowerCase();
  
  if (actionLower.includes('search')) return '🔍';
  if (actionLower.includes('password') || actionLower.includes('reset')) return '🔑';
  if (actionLower.includes('email')) return '📧';
  if (actionLower.includes('delete')) return '🗑️';
  if (actionLower.includes('edit') || actionLower.includes('update')) return '✏️';
  if (actionLower.includes('swap')) return '🔄';
  if (actionLower.includes('certificate') || actionLower.includes('regenerate')) return '📜';
  if (actionLower.includes('grant') || actionLower.includes('access')) return '✅';
  if (actionLower.includes('progress')) return '📊';
  
  return '•';
}
