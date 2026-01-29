// =============================================================================
// PROFILE EDIT MODAL COMPONENT
// =============================================================================
// Path: /app/admin/support/components/modals/ProfileEditModal.tsx
// =============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import type { Profile, ProfileEditData } from '../../types';

// ============================================================================
// TYPES
// ============================================================================

interface ProfileEditModalProps {
  isOpen: boolean;
  profile: Profile | null;
  onSave: (updates: Partial<ProfileEditData>) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

// ============================================================================
// US STATES
// ============================================================================

const US_STATES = [
  { value: '', label: 'Select State' },
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
  { value: 'DC', label: 'Washington D.C.' },
  { value: 'PR', label: 'Puerto Rico' },
];

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ProfileEditModal - Edit customer profile details.
 */
export default function ProfileEditModal({
  isOpen,
  profile,
  onSave,
  onClose,
  isLoading = false,
}: ProfileEditModalProps) {
  const [formData, setFormData] = useState<ProfileEditData>({
    legal_name: '',
    court_state: '',
    court_county: '',
    case_number: '',
    attorney_name: '',
    attorney_email: '',
  });

  // Initialize form when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        legal_name: profile.legal_name || '',
        court_state: profile.court_state || '',
        court_county: profile.court_county || '',
        case_number: profile.case_number || '',
        attorney_name: profile.attorney_name || '',
        attorney_email: profile.attorney_email || '',
      });
    }
  }, [profile]);

  if (!isOpen || !profile) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const inputClasses = "w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#7EC8E3]/50";
  const labelClasses = "block text-sm text-white/60 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#1C1C1C] border border-white/20 rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Edit Profile</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Legal Name */}
          <div>
            <label className={labelClasses}>Legal Name (for certificate)</label>
            <input
              type="text"
              name="legal_name"
              value={formData.legal_name}
              onChange={handleChange}
              placeholder="Full legal name"
              className={inputClasses}
            />
          </div>

          {/* Court Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Court State</label>
              <select
                name="court_state"
                value={formData.court_state}
                onChange={handleChange}
                className={inputClasses}
              >
                {US_STATES.map(state => (
                  <option key={state.value} value={state.value} className="bg-[#1C1C1C]">
                    {state.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClasses}>Court County</label>
              <input
                type="text"
                name="court_county"
                value={formData.court_county}
                onChange={handleChange}
                placeholder="County"
                className={inputClasses}
              />
            </div>
          </div>

          {/* Case Number */}
          <div>
            <label className={labelClasses}>Case Number</label>
            <input
              type="text"
              name="case_number"
              value={formData.case_number}
              onChange={handleChange}
              placeholder="Case number"
              className={inputClasses}
            />
          </div>

          {/* Attorney Info */}
          <div className="pt-4 border-t border-white/10">
            <h4 className="text-sm font-medium text-white/80 mb-3">Attorney Information</h4>
            <div className="space-y-4">
              <div>
                <label className={labelClasses}>Attorney Name</label>
                <input
                  type="text"
                  name="attorney_name"
                  value={formData.attorney_name}
                  onChange={handleChange}
                  placeholder="Attorney name"
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>Attorney Email</label>
                <input
                  type="email"
                  name="attorney_email"
                  value={formData.attorney_email}
                  onChange={handleChange}
                  placeholder="attorney@example.com"
                  className={inputClasses}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-[#77DD77] hover:bg-[#88EE88] text-[#1C1C1C] font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner />
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// LOADING SPINNER
// ============================================================================

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
