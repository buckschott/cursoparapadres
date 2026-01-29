// =============================================================================
// CUSTOMER SEARCH COMPONENT
// =============================================================================
// Path: /app/admin/support/components/CustomerSearch.tsx
// =============================================================================

'use client';

import React, { useState } from 'react';
import type { SearchType } from '../types';

// ============================================================================
// TYPES
// ============================================================================

interface CustomerSearchProps {
  searchQuery: string;
  searchType: SearchType;
  isLoading: boolean;
  onQueryChange: (query: string) => void;
  onTypeChange: (type: SearchType) => void;
  onSearch: () => void;
  onSmartSearch: (query: string) => void;
}

// ============================================================================
// SEARCH TYPE OPTIONS
// ============================================================================

const SEARCH_TYPES: { value: SearchType; label: string; icon: string; placeholder: string }[] = [
  { value: 'email', label: 'Email', icon: '📧', placeholder: 'customer@example.com' },
  { value: 'name', label: 'Name', icon: '👤', placeholder: 'John Smith' },
  { value: 'phone', label: 'Phone', icon: '📱', placeholder: '5551234567' },
  { value: 'certificate', label: 'Certificate', icon: '📜', placeholder: 'PKF-ABC123 or VERIFY123' },
  { value: 'stripe', label: 'Stripe ID', icon: '💳', placeholder: 'cs_live_... or pi_...' },
];

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * CustomerSearch - Search input with type selector and smart detection.
 */
export default function CustomerSearch({
  searchQuery,
  searchType,
  isLoading,
  onQueryChange,
  onTypeChange,
  onSearch,
  onSmartSearch,
}: CustomerSearchProps) {
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const currentType = SEARCH_TYPES.find(t => t.value === searchType) || SEARCH_TYPES[0];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    // Let the smart search detect the type
    setTimeout(() => {
      onSmartSearch(pastedText);
    }, 0);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex items-center gap-3">
        {/* Search Type Selector */}
        <div className="relative">
          <button
            onClick={() => setShowTypeDropdown(!showTypeDropdown)}
            className="flex items-center gap-2 px-3 py-2.5 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg transition-colors min-w-[140px]"
          >
            <span>{currentType.icon}</span>
            <span className="text-sm text-white">{currentType.label}</span>
            <svg 
              className={`w-4 h-4 text-white/60 ml-auto transition-transform ${showTypeDropdown ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showTypeDropdown && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowTypeDropdown(false)} 
              />
              <div className="absolute top-full left-0 mt-1 bg-[#2C2C2C] border border-white/20 rounded-lg shadow-xl z-20 min-w-[160px]">
                {SEARCH_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => {
                      onTypeChange(type.value);
                      setShowTypeDropdown(false);
                    }}
                    className={`
                      w-full flex items-center gap-2 px-3 py-2 text-left text-sm
                      hover:bg-white/10 transition-colors
                      ${type.value === searchType ? 'bg-white/10 text-white' : 'text-white/70'}
                    `}
                  >
                    <span>{type.icon}</span>
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Search Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={currentType.placeholder}
            className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#7EC8E3]/50"
          />
          {searchQuery && (
            <button
              onClick={() => onQueryChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Search Button */}
        <button
          onClick={onSearch}
          disabled={isLoading || !searchQuery.trim()}
          className="px-6 py-2.5 bg-[#7EC8E3] hover:bg-[#9DD8F3] text-[#1C1C1C] font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Searching...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Search</span>
            </>
          )}
        </button>
      </div>

      {/* Smart Search Hint */}
      <p className="text-xs text-white/40 mt-2">
        💡 Tip: Paste any identifier and we&apos;ll auto-detect the type (email, certificate #, Stripe ID, etc.)
      </p>
    </div>
  );
}
