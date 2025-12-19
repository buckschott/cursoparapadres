'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Attorney {
  id: string;
  firm_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  referral_count: number;
  cards_sent: number;
  needs_review: boolean;
  certificate_email?: string | null;
}

type SortField = 'name' | 'state' | 'cards_sent' | 'referral_count' | 'cards_needed' | 'email';
type SortDir = 'asc' | 'desc';

function getDisplayName(a: Attorney): string {
  if (a.first_name || a.last_name) {
    const parts = [];
    if (a.first_name) parts.push(a.first_name.trim());
    if (a.last_name) parts.push(a.last_name.trim());
    return parts.join(' ');
  }
  if (a.firm_name && a.firm_name.trim()) {
    return a.firm_name.trim();
  }
  if (a.email) {
    return a.email.split('@')[0];
  }
  return 'Unknown';
}

function getCardsNeeded(referrals: number, cardsSent: number): number {
  if (cardsSent === 0) {
    return referrals > 0 ? 20 : 0;
  }
  if (referrals >= cardsSent / 2) {
    return 20;
  }
  return 0;
}

const STATE_LIST = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];

export default function AttorneyAdminPage() {
  const [attorneys, setAttorneys] = useState<Attorney[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [needsCardsOnly, setNeedsCardsOnly] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [sortField, setSortField] = useState<SortField>('referral_count');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  
  // Search tab state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Attorney[]>([]);
  const [searching, setSearching] = useState(false);
  
  // Edit modal state
  const [selectedAttorney, setSelectedAttorney] = useState<Attorney | null>(null);
  const [editForm, setEditForm] = useState<Partial<Attorney>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function getCount() {
      const { count } = await supabase.from('attorneys').select('*', { count: 'exact', head: true });
      setTotalCount(count || 0);
    }
    getCount();
  }, []);

  const fetchAttorneys = useCallback(async () => {
    setLoading(true);
    
    let query = supabase
      .from('attorneys')
      .select('id, firm_name, first_name, last_name, email, phone, address, city, state, zip, referral_count, cards_sent, needs_review, certificate_email')
      .limit(500);

    if (stateFilter) query = query.eq('state', stateFilter);
    if (activeTab === 'review') query = query.eq('needs_review', true);

    const { data, error } = await query;
    if (error) { console.error('Error:', error); setLoading(false); return; }

    let filtered = data || [];
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter((a) => getDisplayName(a).toLowerCase().includes(s) || (a.email && a.email.toLowerCase().includes(s)));
    }
    if (needsCardsOnly && activeTab === 'all') {
      filtered = filtered.filter((a) => getCardsNeeded(a.referral_count, a.cards_sent) > 0);
    }

    setAttorneys(filtered);
    setLoading(false);
  }, [search, stateFilter, needsCardsOnly, activeTab]);

  useEffect(() => { fetchAttorneys(); }, [fetchAttorneys]);

  // Search functionality for Search tab
  useEffect(() => {
    const doSearch = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      
      setSearching(true);
      const q = searchQuery.toLowerCase();
      
      const { data, error } = await supabase
        .from('attorneys')
        .select('*')
        .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,firm_name.ilike.%${q}%,email.ilike.%${q}%`)
        .order('referral_count', { ascending: false })
        .limit(50);
      
      if (!error && data) {
        setSearchResults(data);
      }
      setSearching(false);
    };

    const timer = setTimeout(doSearch, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Sort attorneys
  const sortedAttorneys = [...attorneys].sort((a, b) => {
    let aVal: string | number = '';
    let bVal: string | number = '';
    
    switch (sortField) {
      case 'name':
        aVal = getDisplayName(a).toLowerCase();
        bVal = getDisplayName(b).toLowerCase();
        break;
      case 'email':
        aVal = (a.email || '').toLowerCase();
        bVal = (b.email || '').toLowerCase();
        break;
      case 'state':
        aVal = a.state || '';
        bVal = b.state || '';
        break;
      case 'cards_sent':
        aVal = a.cards_sent;
        bVal = b.cards_sent;
        break;
      case 'referral_count':
        aVal = a.referral_count;
        bVal = b.referral_count;
        break;
      case 'cards_needed':
        aVal = getCardsNeeded(a.referral_count, a.cards_sent);
        bVal = getCardsNeeded(b.referral_count, b.cards_sent);
        break;
    }
    
    if (typeof aVal === 'string') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal);
    }
    return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span style={{ opacity: 0.3, marginLeft: '4px' }}>↕</span>;
    return <span style={{ marginLeft: '4px' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  const updateCardsSent = async (id: string, val: number) => {
    await supabase.from('attorneys').update({ cards_sent: val }).eq('id', id);
    setEditingId(null);
    fetchAttorneys();
  };

  const markReviewed = async (id: string) => {
    await supabase.from('attorneys').update({ needs_review: false }).eq('id', id);
    fetchAttorneys();
  };

  const updateField = async (id: string, field: string, val: string) => {
    await supabase.from('attorneys').update({ [field]: val }).eq('id', id);
  };

  // Open edit modal
  const openEditModal = (attorney: Attorney) => {
    setSelectedAttorney(attorney);
    setEditForm({
      firm_name: attorney.firm_name || '',
      first_name: attorney.first_name || '',
      last_name: attorney.last_name || '',
      email: attorney.email || '',
      phone: attorney.phone || '',
      address: attorney.address || '',
      city: attorney.city || '',
      state: attorney.state || '',
      zip: attorney.zip || '',
      referral_count: attorney.referral_count || 0,
      cards_sent: attorney.cards_sent || 0,
      certificate_email: attorney.certificate_email || '',
      needs_review: attorney.needs_review || false,
    });
  };

  // Save attorney changes
  const saveAttorney = async () => {
    if (!selectedAttorney) return;
    
    setSaving(true);
    
    const { error } = await supabase
      .from('attorneys')
      .update(editForm)
      .eq('id', selectedAttorney.id);
    
    if (error) {
      alert('Error saving: ' + error.message);
    } else {
      setAttorneys(prev => prev.map(a => 
        a.id === selectedAttorney.id ? { ...a, ...editForm } as Attorney : a
      ));
      setSearchResults(prev => prev.map(a => 
        a.id === selectedAttorney.id ? { ...a, ...editForm } as Attorney : a
      ));
      setSelectedAttorney(null);
    }
    
    setSaving(false);
  };

  // Delete attorney
  const deleteAttorney = async () => {
    if (!selectedAttorney) return;
    
    if (!confirm(`Are you sure you want to delete ${getDisplayName(selectedAttorney)}?`)) {
      return;
    }
    
    const { error } = await supabase
      .from('attorneys')
      .delete()
      .eq('id', selectedAttorney.id);
    
    if (error) {
      alert('Error deleting: ' + error.message);
    } else {
      setAttorneys(prev => prev.filter(a => a.id !== selectedAttorney.id));
      setSearchResults(prev => prev.filter(a => a.id !== selectedAttorney.id));
      setSelectedAttorney(null);
      fetchAttorneys();
    }
  };

  // Merge attorneys
  const mergeWithAnother = async () => {
    if (!selectedAttorney) return;
    
    const targetEmail = prompt('Enter the email of the attorney to merge INTO this one (their referrals will be added, then they will be deleted):');
    if (!targetEmail) return;
    
    const { data: targetAttorney } = await supabase
      .from('attorneys')
      .select('*')
      .ilike('email', targetEmail.trim())
      .single();
    
    if (!targetAttorney) {
      alert('Attorney not found with that email');
      return;
    }
    
    if (targetAttorney.id === selectedAttorney.id) {
      alert('Cannot merge with itself');
      return;
    }
    
    const newReferralCount = (selectedAttorney.referral_count || 0) + (targetAttorney.referral_count || 0);
    
    if (!confirm(`Merge "${getDisplayName(targetAttorney)}" (${targetAttorney.referral_count} referrals) into "${getDisplayName(selectedAttorney)}"?\n\nTotal will be ${newReferralCount} referrals.\n\n"${getDisplayName(targetAttorney)}" will be DELETED.`)) {
      return;
    }
    
    // Update selected attorney with combined referrals
    await supabase
      .from('attorneys')
      .update({ referral_count: newReferralCount })
      .eq('id', selectedAttorney.id);
    
    // Delete the other attorney
    await supabase
      .from('attorneys')
      .delete()
      .eq('id', targetAttorney.id);
    
    // Update local state
    setEditForm(prev => ({ ...prev, referral_count: newReferralCount }));
    setAttorneys(prev => prev
      .map(a => a.id === selectedAttorney.id ? { ...a, referral_count: newReferralCount } : a)
      .filter(a => a.id !== targetAttorney.id)
    );
    setSearchResults(prev => prev
      .map(a => a.id === selectedAttorney.id ? { ...a, referral_count: newReferralCount } : a)
      .filter(a => a.id !== targetAttorney.id)
    );
    
    alert('Merged successfully!');
  };

  const printLabels = () => {
    const needCards = sortedAttorneys.filter((a) => getCardsNeeded(a.referral_count, a.cards_sent) > 0 && a.address);
    if (needCards.length === 0) { alert('No attorneys with complete addresses need cards'); return; }

    const labelHTML = `<!DOCTYPE html>
<html><head><title>Attorney Mailing Labels</title>
<style>
@page { size: 8.5in 5.5in; margin: 0; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: Arial, sans-serif; }
.label { width: 8.5in; height: 5.5in; padding: 0.5in; page-break-after: always; position: relative; }
.label:last-child { page-break-after: avoid; }
.return-address { position: absolute; top: 0.4in; left: 0.4in; display: flex; align-items: flex-start; gap: 0.25in; }
.logo { width: 1.1in; height: auto; }
.return-text { font-size: 10pt; line-height: 1.4; color: #1a365d; }
.company-name { font-size: 11pt; font-weight: bold; color: #2563eb; margin-top: 0.08in; }
.recipient { position: absolute; bottom: 1.2in; left: 3.2in; font-size: 13pt; line-height: 1.5; }
.firm-name { font-weight: bold; font-size: 14pt; margin-bottom: 2px; }
.attorney-name { font-size: 13pt; }
.address-line { font-size: 13pt; }
</style></head><body>
${needCards.map(a => `<div class="label">
<div class="return-address"><img src="/logo.png" alt="PKF" class="logo" /><div>
<div class="return-text">PO BOX 1265</div>
<div class="return-text">MOUNT PLEASANT TX 75456-1265</div>
<div class="company-name">Putting Kids First ®</div></div></div>
<div class="recipient">
${a.firm_name ? `<div class="firm-name">${a.firm_name.toUpperCase()}</div>` : ''}
<div class="attorney-name">${getDisplayName(a).toUpperCase()}</div>
<div class="address-line">${(a.address || '').toUpperCase()}</div>
<div class="address-line">${(a.city || '').toUpperCase()} ${(a.state || '').toUpperCase()} ${a.zip || ''}</div>
</div></div>`).join('\n')}
</body></html>`;

    const w = window.open('', '_blank');
    if (w) { w.document.write(labelHTML); w.document.close(); setTimeout(() => w.print(), 500); }
  };

  const exportCSV = () => {
    const csv = 'Name,Firm,Email,Address,City,State,Zip,Cards Sent,Referrals,Cards Needed\n' + sortedAttorneys.map((a) => 
      [getDisplayName(a), a.firm_name || '', a.email || '', a.address || '', a.city || '', a.state || '', a.zip || '', a.cards_sent, a.referral_count, getCardsNeeded(a.referral_count, a.cards_sent)].map(v => `"${v}"`).join(',')
    ).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    link.download = 'attorneys.csv';
    link.click();
  };

  const reviewCount = attorneys.filter((a) => a.needs_review).length;
  const needCardsCount = attorneys.filter((a) => getCardsNeeded(a.referral_count, a.cards_sent) > 0).length;

  const thStyle = (field: SortField, width?: string): React.CSSProperties => ({
    padding: '12px 8px',
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    cursor: 'pointer',
    userSelect: 'none',
    width: width || 'auto',
    whiteSpace: 'nowrap'
  });

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px'
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '20px', fontFamily: "'Courier Prime', Courier, monospace" }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '20px', color: '#1e293b' }}>Attorney Database</h1>

        <div style={{ display: 'flex', gap: '4px', marginBottom: '0' }}>
          <button onClick={() => setActiveTab('all')} style={{ padding: '10px 20px', borderRadius: '8px 8px 0 0', fontWeight: '600', fontSize: '14px', backgroundColor: activeTab === 'all' ? '#fff' : '#e2e8f0', color: activeTab === 'all' ? '#1e293b' : '#64748b', border: 'none', cursor: 'pointer' }}>
            All Attorneys
          </button>
          <button onClick={() => setActiveTab('review')} style={{ padding: '10px 20px', borderRadius: '8px 8px 0 0', fontWeight: '600', fontSize: '14px', backgroundColor: activeTab === 'review' ? '#fff' : '#e2e8f0', color: activeTab === 'review' ? '#1e293b' : '#64748b', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            Needs Review
            {reviewCount > 0 && <span style={{ backgroundColor: '#f97316', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '11px' }}>{reviewCount}</span>}
          </button>
          <button onClick={() => setActiveTab('search')} style={{ padding: '10px 20px', borderRadius: '8px 8px 0 0', fontWeight: '600', fontSize: '14px', backgroundColor: activeTab === 'search' ? '#fff' : '#e2e8f0', color: activeTab === 'search' ? '#1e293b' : '#64748b', border: 'none', cursor: 'pointer' }}>
            🔍 Search & Edit
          </button>
        </div>

        {/* Filters for All and Review tabs */}
        {(activeTab === 'all' || activeTab === 'review') && (
          <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '0 8px 8px 8px', marginBottom: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1, minWidth: '180px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: '500' }}>Filter</label>
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter by name or email..." style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px' }} />
              </div>
              <div style={{ width: '120px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: '500' }}>State</label>
                <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px' }}>
                  <option value="">All</option>
                  {STATE_LIST.map((st) => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>
              {activeTab === 'all' && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingBottom: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={needsCardsOnly} onChange={(e) => setNeedsCardsOnly(e.target.checked)} style={{ width: '14px', height: '14px' }} />
                  <span style={{ fontSize: '13px', color: '#475569' }}>Needs cards ({needCardsCount})</span>
                </label>
              )}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={printLabels} style={{ padding: '8px 16px', backgroundColor: '#16a34a', color: '#fff', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>🖨️ Print Labels</button>
                <button onClick={exportCSV} style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: '#fff', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>Export CSV</button>
              </div>
            </div>
          </div>
        )}

        {/* Search tab content */}
        {activeTab === 'search' && (
          <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '0 8px 8px 8px', marginBottom: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, firm, or email..."
                style={{ width: '100%', maxWidth: '400px', padding: '12px 16px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }}
                autoFocus
              />
              {searching && <span style={{ marginLeft: '12px', color: '#64748b' }}>Searching...</span>}
            </div>
            
            {searchResults.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#475569' }}>Name</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#475569' }}>Firm</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#475569' }}>Email</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: '#475569' }}>State</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: '#475569' }}>Referrals</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: '#475569' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((a, idx) => (
                    <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: a.needs_review ? '#fefce8' : (idx % 2 === 0 ? '#fff' : '#fafbfc') }}>
                      <td style={{ padding: '12px 8px', fontSize: '14px', color: '#1e293b', fontWeight: '500' }}>{getDisplayName(a)}</td>
                      <td style={{ padding: '12px 8px', fontSize: '13px', color: '#64748b' }}>{a.firm_name || '-'}</td>
                      <td style={{ padding: '12px 8px', fontSize: '12px', color: '#64748b' }}>{a.email || '-'}</td>
                      <td style={{ padding: '12px 8px', fontSize: '14px', textAlign: 'center', color: '#64748b' }}>{a.state || '-'}</td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{a.referral_count}</td>
                      <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                        <button onClick={() => openEditModal(a)} style={{ padding: '6px 12px', backgroundColor: '#3b82f6', color: '#fff', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : searchQuery.length >= 2 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No results found</div>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Enter at least 2 characters to search</div>
            )}
          </div>
        )}

        {/* All Attorneys tab */}
        {activeTab === 'all' && (
          <>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>Showing {sortedAttorneys.length} of {totalCount} attorneys</div>
            <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading...</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th onClick={() => handleSort('name')} style={{ ...thStyle('name'), textAlign: 'left', paddingLeft: '16px' }}>Name <SortIcon field="name" /></th>
                      <th onClick={() => handleSort('email')} style={{ ...thStyle('email'), textAlign: 'left' }}>Email <SortIcon field="email" /></th>
                      <th onClick={() => handleSort('state')} style={thStyle('state', '70px')}>State <SortIcon field="state" /></th>
                      <th onClick={() => handleSort('cards_sent')} style={thStyle('cards_sent', '110px')}>Cards Sent <SortIcon field="cards_sent" /></th>
                      <th onClick={() => handleSort('referral_count')} style={thStyle('referral_count', '100px')}>Referrals <SortIcon field="referral_count" /></th>
                      <th onClick={() => handleSort('cards_needed')} style={thStyle('cards_needed', '120px')}>Cards Needed <SortIcon field="cards_needed" /></th>
                      <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: '#475569', width: '70px' }}>Edit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAttorneys.map((a, idx) => {
                      const needed = getCardsNeeded(a.referral_count, a.cards_sent);
                      return (
                        <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: a.needs_review ? '#fefce8' : (idx % 2 === 0 ? '#fff' : '#fafbfc') }}>
                          <td style={{ padding: '12px 16px', fontSize: '14px', color: '#1e293b' }}>{getDisplayName(a)}</td>
                          <td style={{ padding: '12px 8px', fontSize: '12px', color: '#64748b' }}>{a.email || '-'}</td>
                          <td style={{ padding: '12px 8px', fontSize: '14px', textAlign: 'center', color: '#64748b' }}>{a.state || '-'}</td>
                          <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                            {editingId === a.id ? (
                              <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => updateCardsSent(a.id, parseInt(editValue) || 0)} onKeyDown={(e) => { if (e.key === 'Enter') updateCardsSent(a.id, parseInt(editValue) || 0); if (e.key === 'Escape') setEditingId(null); }} style={{ width: '60px', padding: '4px', textAlign: 'center', border: '2px solid #3b82f6', borderRadius: '4px', fontSize: '14px' }} autoFocus />
                            ) : (
                              <span onClick={() => { setEditingId(a.id); setEditValue(String(a.cards_sent)); }} style={{ cursor: 'pointer', padding: '4px 10px', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#1e293b', fontSize: '14px', fontWeight: '500' }} title="Click to edit">{a.cards_sent}</span>
                            )}
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: '14px', color: '#64748b' }}>{a.referral_count}</td>
                          <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                            {needed > 0 ? <span style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '3px 10px', borderRadius: '10px', fontWeight: '700', fontSize: '13px' }}>{needed}</span> : <span style={{ color: '#94a3b8', fontSize: '14px' }}>0</span>}
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                            <button onClick={() => openEditModal(a)} style={{ padding: '4px 8px', backgroundColor: '#e2e8f0', color: '#475569', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '12px' }}>✏️</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* Review tab */}
        {activeTab === 'review' && (
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading...</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#475569', width: '170px' }}>Name</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#475569', width: '200px' }}>Firm Name</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#475569', width: '200px' }}>Email</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#475569', width: '310px' }}>Address</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#475569', width: '160px' }}>City</th>
                    <th style={{ padding: '12px 4px', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: '#475569', width: '40px' }}>ST</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: '#475569', width: '100px' }}>Zip</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: '#475569', width: '70px' }}>Done</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAttorneys.filter(a => a.needs_review).map((a) => (
                    <tr key={a.id} style={{ backgroundColor: '#fffbeb', borderBottom: '1px solid #fef3c7' }}>
                      <td style={{ padding: '10px 8px' }}>
                        <input type="text" defaultValue={getDisplayName(a)} onBlur={(e) => {
                          const parts = e.target.value.trim().split(' ');
                          const firstName = parts[0] || '';
                          const lastName = parts.slice(1).join(' ') || '';
                          updateField(a.id, 'first_name', firstName);
                          updateField(a.id, 'last_name', lastName);
                        }} placeholder="Name" style={{ width: '100%', padding: '6px 8px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '13px' }} />
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        <input type="text" defaultValue={a.firm_name || ''} onBlur={(e) => updateField(a.id, 'firm_name', e.target.value)} placeholder="Firm name" style={{ width: '100%', padding: '6px 8px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '13px' }} />
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        <input type="text" defaultValue={a.email || ''} onBlur={(e) => updateField(a.id, 'email', e.target.value)} placeholder="Email" style={{ width: '100%', padding: '6px 8px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '12px' }} />
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        <input type="text" defaultValue={a.address || ''} onBlur={(e) => updateField(a.id, 'address', e.target.value)} placeholder="Enter address" style={{ width: '100%', padding: '6px 8px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '13px' }} />
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        <input type="text" defaultValue={a.city || ''} onBlur={(e) => updateField(a.id, 'city', e.target.value)} placeholder="City" style={{ width: '100%', padding: '6px 8px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '13px' }} />
                      </td>
                      <td style={{ padding: '10px 4px', textAlign: 'center' }}>
                        <input type="text" defaultValue={a.state || ''} onBlur={(e) => updateField(a.id, 'state', e.target.value.toUpperCase())} style={{ width: '36px', padding: '6px 2px', textAlign: 'center', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '12px' }} maxLength={2} />
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        <input type="text" defaultValue={a.zip || ''} onBlur={(e) => updateField(a.id, 'zip', e.target.value)} placeholder="Zip" style={{ width: '100%', padding: '6px 8px', textAlign: 'center', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '13px' }} />
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        <button onClick={() => markReviewed(a.id)} style={{ padding: '5px 10px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>✓</button>
                      </td>
                    </tr>
                  ))}
                  {sortedAttorneys.filter(a => a.needs_review).length === 0 && (
                    <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No attorneys need review</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {selectedAttorney && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Edit Attorney</h2>
            </div>
            
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>First Name</label>
                  <input type="text" value={editForm.first_name || ''} onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Last Name</label>
                  <input type="text" value={editForm.last_name || ''} onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })} style={inputStyle} />
                </div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Firm Name</label>
                <input type="text" value={editForm.firm_name || ''} onChange={(e) => setEditForm({ ...editForm, firm_name: e.target.value })} style={inputStyle} />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Email</label>
                <input type="email" value={editForm.email || ''} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} style={inputStyle} />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Phone</label>
                <input type="text" value={editForm.phone || ''} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} style={inputStyle} />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Address</label>
                <input type="text" value={editForm.address || ''} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} style={inputStyle} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>City</label>
                  <input type="text" value={editForm.city || ''} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>State</label>
                  <select value={editForm.state || ''} onChange={(e) => setEditForm({ ...editForm, state: e.target.value })} style={inputStyle}>
                    <option value="">Select</option>
                    {STATE_LIST.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>ZIP</label>
                  <input type="text" value={editForm.zip || ''} onChange={(e) => setEditForm({ ...editForm, zip: e.target.value })} style={inputStyle} />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Referral Count</label>
                  <input type="number" value={editForm.referral_count || 0} onChange={(e) => setEditForm({ ...editForm, referral_count: parseInt(e.target.value) || 0 })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>Cards Sent</label>
                  <input type="number" value={editForm.cards_sent || 0} onChange={(e) => setEditForm({ ...editForm, cards_sent: parseInt(e.target.value) || 0 })} style={inputStyle} />
                </div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={editForm.needs_review || false} onChange={(e) => setEditForm({ ...editForm, needs_review: e.target.checked })} style={{ width: '16px', height: '16px' }} />
                  <span style={{ fontSize: '14px', color: '#475569' }}>Needs Review</span>
                </label>
              </div>
            </div>
            
            <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={deleteAttorney} style={{ padding: '10px 16px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Delete</button>
                <button onClick={mergeWithAnother} style={{ padding: '10px 16px', backgroundColor: '#fef3c7', color: '#d97706', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Merge</button>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setSelectedAttorney(null)} style={{ padding: '10px 16px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>Cancel</button>
                <button onClick={saveAttorney} disabled={saving} style={{ padding: '10px 16px', backgroundColor: '#3b82f6', color: '#fff', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px', opacity: saving ? 0.5 : 1 }}>{saving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}