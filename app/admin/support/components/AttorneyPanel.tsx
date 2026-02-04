// =============================================================================
// ATTORNEY PANEL COMPONENT
// =============================================================================
// Path: /app/admin/support/components/AttorneyPanel.tsx
// Embedded in support panel as "Attorneys" tab
// =============================================================================

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase';

// =============================================================================
// TYPES
// =============================================================================

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
  current_year_referrals: number;
  referral_year: number;
  cards_sent: number;
  last_cards_sent_date: string | null;
  needs_review: boolean;
  certificate_email: string | null;
  created_at: string | null;
  updated_at: string | null;
}

type SortField = 'name' | 'state' | 'cards_sent' | 'referral_count' | 'cards_needed' | 'email';
type SortDir = 'asc' | 'desc';
type SubTab = 'all' | 'review' | 'search' | 'import';
type LetterTemplate = 'standard' | 'claseparapadres';

interface ImportRow {
  email: string;
  name: string;
  firm: string;
  matchedAttorney: Attorney | null;
  matchType: 'exact-email' | 'fuzzy-name' | 'new';
  selected: boolean;
}

// =============================================================================
// HELPERS
// =============================================================================

function getDisplayName(a: Attorney): string {
  if (a.first_name || a.last_name) {
    const parts = [];
    if (a.first_name) parts.push(a.first_name.trim());
    if (a.last_name) parts.push(a.last_name.trim());
    return parts.join(' ');
  }
  if (a.firm_name && a.firm_name.trim()) return a.firm_name.trim();
  if (a.email) return a.email.split('@')[0];
  return 'Unknown';
}

function getCardsNeeded(referrals: number, cardsSent: number): number {
  if (cardsSent === 0) return referrals > 0 ? 20 : 0;
  if (referrals >= cardsSent / 2) return 20;
  return 0;
}

function fuzzyMatch(str1: string, str2: string): boolean {
  const a = str1.toLowerCase().trim();
  const b = str2.toLowerCase().trim();
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  // Check if last names match (most reliable for attorneys)
  const aParts = a.split(/\s+/);
  const bParts = b.split(/\s+/);
  const aLast = aParts[aParts.length - 1];
  const bLast = bParts[bParts.length - 1];
  if (aLast.length > 2 && bLast.length > 2 && aLast === bLast) return true;
  return false;
}

const STATE_LIST = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'
];

// =============================================================================
// LETTER TEMPLATES
// =============================================================================

function generateLetterHTML(attorneys: Attorney[], template: LetterTemplate): string {
  const isSpanishIntro = template === 'claseparapadres';

  const letterBody = isSpanishIntro
    ? `<p>We would like to express our sincere gratitude for referring your clients to Putting Kids First. Your support and trust in our organization have helped us achieve our mission of creating happy and safe childhood memories for all children.</p>

<p>We are excited to share that we have launched <strong>Clase para Padres</strong> (<a href="https://claseparapadres.com" style="color: #2563eb;">claseparapadres.com</a>), our new Spanish-language parenting education platform. Your Spanish-speaking clients can now complete their court-ordered parenting class entirely in Spanish&mdash;same quality content, same instant certificate delivery, same court acceptance nationwide.</p>

<p>As always, when your client provides your email address on their registration form, we will notify you immediately upon their completion of the class. This notification will include a copy of the certificate of completion, ensuring you receive timely documentation for your records.</p>

<p>If you require more Client Referral Cards to provide to your clients, please let us know. We enclose 20 cards and will be happy to supply them as needed. Please contact us at <a href="mailto:info@puttingkidsfirst.org" style="color: #2563eb;">info@puttingkidsfirst.org</a> for additional cards.</p>

<p>Thank you again for your continued support, and we look forward to working with you again in the future.</p>`
    : `<p>We would like to express our sincere gratitude for referring your clients to Putting Kids First. Your support and trust in our organization have helped us achieve our mission of creating happy and safe childhood memories for all children.</p>

<p>We also want to remind you of our unique attorney notification process at Putting Kids First. When your client provides your email address on their test or registration form, we will notify you immediately upon their completion of the test. This notification will include a copy of the certificate of completion, ensuring you receive timely documentation for your records.</p>

<p>If you require more Client Referral Cards to provide to your clients, please let us know. We enclose 20 cards and will be happy to supply them as needed. Please contact us at <a href="mailto:info@puttingkidsfirst.org" style="color: #2563eb;">info@puttingkidsfirst.org</a> for additional cards.</p>

<p>Thank you again for your continued support, and we look forward to working with you again in the future.</p>`;

  const signatureLinks = isSpanishIntro
    ? `<div style="font-size: 11pt; color: #475569;">info@puttingkidsfirst.org</div>
<div style="font-size: 11pt;"><a href="https://puttingkidsfirst.org" style="color: #2563eb; text-decoration: none;">puttingkidsfirst.org</a> &nbsp;|&nbsp; <a href="https://claseparapadres.com" style="color: #2563eb; text-decoration: none;">claseparapadres.com</a></div>`
    : `<div style="font-size: 11pt; color: #475569;">info@puttingkidsfirst.org</div>
<div style="font-size: 11pt;"><a href="https://puttingkidsfirst.org" style="color: #2563eb; text-decoration: none;">https://puttingkidsfirst.org</a></div>`;

  const contactInfo = isSpanishIntro
    ? `<div style="text-align: center; font-size: 10pt; color: #475569; line-height: 1.5;">
        Toll Free: 888 777 2298<br/>
        <a href="https://puttingkidsfirst.org" style="color: #2563eb; text-decoration: none;">puttingkidsfirst.org</a> | <a href="https://claseparapadres.com" style="color: #2563eb; text-decoration: none;">claseparapadres.com</a><br/>
        info@puttingkidsfirst.org
      </div>`
    : `<div style="text-align: center; font-size: 10pt; color: #475569; line-height: 1.5;">
        Toll Free: 888 777 2298<br/>
        <a href="https://puttingkidsfirst.org" style="color: #2563eb; text-decoration: none;">https://puttingkidsfirst.org</a><br/>
        info@puttingkidsfirst.org
      </div>`;

  return `<!DOCTYPE html>
<html><head><title>Attorney Letter${isSpanishIntro ? ' - Clase para Padres' : ''}</title>
<style>
@page { size: letter; margin: 0; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: Georgia, 'Times New Roman', serif; }
.page {
  width: 8.5in;
  min-height: 11in;
  padding: 0.75in 1in;
  page-break-after: always;
  position: relative;
}
.page:last-child { page-break-after: avoid; }
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.6in;
  padding-bottom: 0.15in;
  border-bottom: 2px solid #2563eb;
}
.tagline {
  font-family: 'Courier New', Courier, monospace;
  font-size: 20pt;
  font-weight: bold;
  color: #2563eb;
  line-height: 1.3;
}
.logo-section {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}
.logo-section img {
  width: 1.3in;
  height: auto;
}
.body-text {
  font-size: 12pt;
  line-height: 1.7;
  color: #1e293b;
  margin-bottom: 0.25in;
}
.body-text p {
  margin-bottom: 0.2in;
}
.signature {
  margin-top: 0.4in;
}
.signature .regards {
  font-size: 12pt;
  color: #1e293b;
  margin-bottom: 0.15in;
}
.signature .company {
  font-family: 'Courier New', Courier, monospace;
  font-size: 16pt;
  color: #2563eb;
  font-weight: bold;
  margin-bottom: 0.05in;
}
.enclosure {
  margin-top: 0.5in;
  font-size: 11pt;
  color: #64748b;
}
@media print {
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
</style></head><body>
${attorneys.map(a => `<div class="page">
  <div class="header">
    <div class="tagline">Better Parenting<br/>for Happier Kids</div>
    ${contactInfo}
    <div class="logo-section">
      <img src="/logo.png" alt="Putting Kids First" />
    </div>
  </div>

  <div class="body-text">
    ${letterBody}
  </div>

  <div class="signature">
    <div class="regards">Best regards,</div>
    <div class="company">Putting Kids First</div>
    ${signatureLinks}
  </div>

  <div class="enclosure">Enclosure</div>
</div>`).join('\n')}
</body></html>`;
}

// =============================================================================
// LABEL TEMPLATE (existing)
// =============================================================================

function generateLabelsHTML(attorneys: Attorney[]): string {
  return `<!DOCTYPE html>
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
${attorneys.map(a => `<div class="label">
<div class="return-address"><img src="/logo.png" alt="PKF" class="logo" /><div>
<div class="return-text">PO BOX 1265</div>
<div class="return-text">MOUNT PLEASANT TX 75456-1265</div>
<div class="company-name">Putting Kids First \u00AE</div></div></div>
<div class="recipient">
${a.firm_name ? `<div class="firm-name">${a.firm_name.toUpperCase()}</div>` : ''}
<div class="attorney-name">${getDisplayName(a).toUpperCase()}</div>
<div class="address-line">${(a.address || '').toUpperCase()}</div>
<div class="address-line">${(a.city || '').toUpperCase()} ${(a.state || '').toUpperCase()} ${a.zip || ''}</div>
</div></div>`).join('\n')}
</body></html>`;
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function AttorneyPanel() {
  const supabase = createClient();

  // ---------------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------------
  const [attorneys, setAttorneys] = useState<Attorney[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [needsCardsOnly, setNeedsCardsOnly] = useState(false);
  const [subTab, setSubTab] = useState<SubTab>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [sortField, setSortField] = useState<SortField>('referral_count');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Search tab
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Attorney[]>([]);
  const [searching, setSearching] = useState(false);

  // Edit modal
  const [selectedAttorney, setSelectedAttorney] = useState<Attorney | null>(null);
  const [editForm, setEditForm] = useState<Partial<Attorney>>({});
  const [saving, setSaving] = useState(false);

  // Letter modal
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [letterTemplate, setLetterTemplate] = useState<LetterTemplate>('standard');
  const [letterTarget, setLetterTarget] = useState<'needs-cards' | 'filtered' | 'single'>('needs-cards');
  const [singleLetterAttorney, setSingleLetterAttorney] = useState<Attorney | null>(null);

  // Import
  const [importData, setImportData] = useState<ImportRow[]>([]);
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<string>('');
  const [isImporting, setIsImporting] = useState(false);
  const [importComplete, setImportComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add new attorney
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAttorney, setNewAttorney] = useState({
    first_name: '', last_name: '', firm_name: '', email: '',
    phone: '', address: '', city: '', state: '', zip: '',
    certificate_email: '',
  });

  // ---------------------------------------------------------------------------
  // FETCH
  // ---------------------------------------------------------------------------

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
      .select('*')
      .limit(500);

    if (stateFilter) query = query.eq('state', stateFilter);
    if (subTab === 'review') query = query.eq('needs_review', true);

    const { data, error } = await query;
    if (error) { console.error('Error:', error); setLoading(false); return; }

    let filtered = data || [];
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(a =>
        getDisplayName(a).toLowerCase().includes(s) ||
        (a.email && a.email.toLowerCase().includes(s)) ||
        (a.firm_name && a.firm_name.toLowerCase().includes(s))
      );
    }
    if (needsCardsOnly && subTab === 'all') {
      filtered = filtered.filter(a => getCardsNeeded(a.referral_count, a.cards_sent) > 0);
    }
    setAttorneys(filtered);
    setLoading(false);
  }, [search, stateFilter, needsCardsOnly, subTab]);

  useEffect(() => { fetchAttorneys(); }, [fetchAttorneys]);

  // Search tab - debounced search
  useEffect(() => {
    const doSearch = async () => {
      if (searchQuery.length < 2) { setSearchResults([]); return; }
      setSearching(true);
      const q = searchQuery.toLowerCase();
      const { data, error } = await supabase
        .from('attorneys')
        .select('*')
        .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,firm_name.ilike.%${q}%,email.ilike.%${q}%`)
        .order('referral_count', { ascending: false })
        .limit(50);
      if (!error && data) setSearchResults(data);
      setSearching(false);
    };
    const timer = setTimeout(doSearch, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ---------------------------------------------------------------------------
  // SORT
  // ---------------------------------------------------------------------------

  const sortedAttorneys = [...attorneys].sort((a, b) => {
    let aVal: string | number = '';
    let bVal: string | number = '';
    switch (sortField) {
      case 'name': aVal = getDisplayName(a).toLowerCase(); bVal = getDisplayName(b).toLowerCase(); break;
      case 'email': aVal = (a.email || '').toLowerCase(); bVal = (b.email || '').toLowerCase(); break;
      case 'state': aVal = a.state || ''; bVal = b.state || ''; break;
      case 'cards_sent': aVal = a.cards_sent; bVal = b.cards_sent; break;
      case 'referral_count': aVal = a.referral_count; bVal = b.referral_count; break;
      case 'cards_needed': aVal = getCardsNeeded(a.referral_count, a.cards_sent); bVal = getCardsNeeded(b.referral_count, b.cards_sent); break;
    }
    if (typeof aVal === 'string') return sortDir === 'asc' ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal);
    return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="opacity-30 ml-1">↕</span>;
    return <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  // ---------------------------------------------------------------------------
  // CRUD
  // ---------------------------------------------------------------------------

  const updateCardsSent = async (id: string, val: number) => {
    await supabase.from('attorneys').update({ cards_sent: val, last_cards_sent_date: new Date().toISOString().split('T')[0] }).eq('id', id);
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

  const saveAttorney = async () => {
    if (!selectedAttorney) return;
    setSaving(true);
    const { error } = await supabase.from('attorneys').update(editForm).eq('id', selectedAttorney.id);
    if (error) { alert('Error saving: ' + error.message); }
    else {
      setAttorneys(prev => prev.map(a => a.id === selectedAttorney.id ? { ...a, ...editForm } as Attorney : a));
      setSearchResults(prev => prev.map(a => a.id === selectedAttorney.id ? { ...a, ...editForm } as Attorney : a));
      setSelectedAttorney(null);
    }
    setSaving(false);
  };

  const deleteAttorney = async () => {
    if (!selectedAttorney || !confirm(`Delete ${getDisplayName(selectedAttorney)}?`)) return;
    const { error } = await supabase.from('attorneys').delete().eq('id', selectedAttorney.id);
    if (error) { alert('Error: ' + error.message); }
    else {
      setAttorneys(prev => prev.filter(a => a.id !== selectedAttorney.id));
      setSearchResults(prev => prev.filter(a => a.id !== selectedAttorney.id));
      setSelectedAttorney(null);
      fetchAttorneys();
    }
  };

  const mergeWithAnother = async () => {
    if (!selectedAttorney) return;
    const targetEmail = prompt('Enter the email of the attorney to merge INTO this one:');
    if (!targetEmail) return;
    const { data: target } = await supabase.from('attorneys').select('*').ilike('email', targetEmail.trim()).single();
    if (!target) { alert('Attorney not found'); return; }
    if (target.id === selectedAttorney.id) { alert('Cannot merge with itself'); return; }
    const newCount = (selectedAttorney.referral_count || 0) + (target.referral_count || 0);
    if (!confirm(`Merge "${getDisplayName(target)}" (${target.referral_count} referrals) into "${getDisplayName(selectedAttorney)}"?\nTotal: ${newCount}. "${getDisplayName(target)}" will be DELETED.`)) return;
    await supabase.from('attorneys').update({ referral_count: newCount }).eq('id', selectedAttorney.id);
    await supabase.from('attorneys').delete().eq('id', target.id);
    setEditForm(prev => ({ ...prev, referral_count: newCount }));
    setAttorneys(prev => prev.map(a => a.id === selectedAttorney.id ? { ...a, referral_count: newCount } : a).filter(a => a.id !== target.id));
    setSearchResults(prev => prev.map(a => a.id === selectedAttorney.id ? { ...a, referral_count: newCount } : a).filter(a => a.id !== target.id));
    alert('Merged!');
  };

  const addNewAttorney = async () => {
    if (!newAttorney.first_name && !newAttorney.last_name && !newAttorney.firm_name) {
      alert('Enter at least a name or firm name');
      return;
    }
    const { error } = await supabase.from('attorneys').insert({
      ...newAttorney,
      referral_count: 0,
      cards_sent: 0,
      needs_review: false,
      full_name_search: `${newAttorney.first_name} ${newAttorney.last_name}`.trim(),
    });
    if (error) { alert('Error: ' + error.message); }
    else {
      setNewAttorney({ first_name: '', last_name: '', firm_name: '', email: '', phone: '', address: '', city: '', state: '', zip: '', certificate_email: '' });
      setShowAddForm(false);
      fetchAttorneys();
    }
  };

  // ---------------------------------------------------------------------------
  // PRINT
  // ---------------------------------------------------------------------------

  const getMailableAttorneys = () => sortedAttorneys.filter(a => getCardsNeeded(a.referral_count, a.cards_sent) > 0 && a.address);

  const printLabels = () => {
    const needCards = getMailableAttorneys();
    if (needCards.length === 0) { alert('No attorneys with complete addresses need cards'); return; }
    const w = window.open('', '_blank');
    if (w) { w.document.write(generateLabelsHTML(needCards)); w.document.close(); setTimeout(() => w.print(), 500); }
  };

  const printLetters = () => {
    let targetAttorneys: Attorney[] = [];
    if (letterTarget === 'single' && singleLetterAttorney) {
      targetAttorneys = [singleLetterAttorney];
    } else if (letterTarget === 'filtered') {
      targetAttorneys = sortedAttorneys.filter(a => a.address);
    } else {
      targetAttorneys = getMailableAttorneys();
    }
    if (targetAttorneys.length === 0) { alert('No attorneys match the selected criteria'); return; }
    const w = window.open('', '_blank');
    if (w) { w.document.write(generateLetterHTML(targetAttorneys, letterTemplate)); w.document.close(); setTimeout(() => w.print(), 500); }
    setShowLetterModal(false);
  };

  const openLetterModal = (singleAttorney?: Attorney) => {
    if (singleAttorney) {
      setSingleLetterAttorney(singleAttorney);
      setLetterTarget('single');
    } else {
      setSingleLetterAttorney(null);
      setLetterTarget('needs-cards');
    }
    setShowLetterModal(true);
  };

  const exportCSV = () => {
    const csv = 'Name,Firm,Email,Certificate Email,Phone,Address,City,State,Zip,Cards Sent,Referrals,Cards Needed\n' +
      sortedAttorneys.map(a =>
        [getDisplayName(a), a.firm_name || '', a.email || '', a.certificate_email || '', a.phone || '', a.address || '', a.city || '', a.state || '', a.zip || '', a.cards_sent, a.referral_count, getCardsNeeded(a.referral_count, a.cards_sent)].map(v => `"${v}"`).join(',')
      ).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    link.download = `attorneys-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // ---------------------------------------------------------------------------
  // IMPORT
  // ---------------------------------------------------------------------------

  const parseCSV = (text: string): { headers: string[]; rows: string[][] } => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length === 0) return { headers: [], rows: [] };
    const parseRow = (line: string) => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') { inQuotes = !inQuotes; }
        else if (c === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
        else { current += c; }
      }
      result.push(current.trim());
      return result;
    };
    const headers = parseRow(lines[0]);
    const rows = lines.slice(1).map(parseRow);
    return { headers, rows };
  };

  const processImport = async (entries: { email: string; name: string; firm: string }[]) => {
    setImportStatus('Matching against database...');
    // Fetch all attorneys for matching
    const { data: allAttorneys } = await supabase.from('attorneys').select('*');
    if (!allAttorneys) { setImportStatus('Error fetching attorneys'); return; }

    const results: ImportRow[] = entries.map(entry => {
      // Try exact email match first
      if (entry.email) {
        const emailMatch = allAttorneys.find(a =>
          (a.email && a.email.toLowerCase() === entry.email.toLowerCase()) ||
          (a.certificate_email && a.certificate_email.toLowerCase() === entry.email.toLowerCase())
        );
        if (emailMatch) return { ...entry, matchedAttorney: emailMatch, matchType: 'exact-email' as const, selected: true };
      }
      // Try fuzzy name match
      if (entry.name) {
        const nameMatch = allAttorneys.find(a => fuzzyMatch(getDisplayName(a), entry.name));
        if (nameMatch) return { ...entry, matchedAttorney: nameMatch, matchType: 'fuzzy-name' as const, selected: true };
      }
      // No match — new attorney
      return { ...entry, matchedAttorney: null, matchType: 'new' as const, selected: true };
    });

    setImportData(results);
    const matched = results.filter(r => r.matchType !== 'new').length;
    const newCount = results.filter(r => r.matchType === 'new').length;
    setImportStatus(`Found ${matched} matches and ${newCount} new attorneys. Review below.`);
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportStatus('Parsing file...');
    setImportData([]);
    setImportComplete(false);

    const text = await file.text();
    const { headers, rows } = parseCSV(text);

    // Auto-detect columns
    const emailCol = headers.findIndex(h => /email/i.test(h));
    const nameCol = headers.findIndex(h => /^(name|full.?name|attorney|sender)/i.test(h));
    const firstNameCol = headers.findIndex(h => /first.?name/i.test(h));
    const lastNameCol = headers.findIndex(h => /last.?name/i.test(h));
    const firmCol = headers.findIndex(h => /firm|company|organization/i.test(h));

    const entries = rows.map(row => {
      const email = emailCol >= 0 ? row[emailCol] || '' : '';
      let name = '';
      if (nameCol >= 0) name = row[nameCol] || '';
      else if (firstNameCol >= 0 || lastNameCol >= 0) {
        const fn = firstNameCol >= 0 ? row[firstNameCol] || '' : '';
        const ln = lastNameCol >= 0 ? row[lastNameCol] || '' : '';
        name = `${fn} ${ln}`.trim();
      }
      const firm = firmCol >= 0 ? row[firmCol] || '' : '';
      return { email, name, firm };
    }).filter(e => e.email || e.name);

    if (entries.length === 0) {
      setImportStatus('No valid entries found. Make sure CSV has email or name columns.');
      return;
    }

    await processImport(entries);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTextImport = async () => {
    if (!importText.trim()) return;
    setImportData([]);
    setImportComplete(false);

    const lines = importText.split('\n').map(l => l.trim()).filter(l => l);
    const entries = lines.map(line => {
      // If it looks like an email, use as email
      if (line.includes('@')) return { email: line, name: '', firm: '' };
      // Otherwise treat as name
      return { email: '', name: line, firm: '' };
    });

    await processImport(entries);
  };

  const toggleImportRow = (idx: number) => {
    setImportData(prev => prev.map((row, i) => i === idx ? { ...row, selected: !row.selected } : row));
  };

  const commitImport = async () => {
    const selected = importData.filter(r => r.selected);
    if (selected.length === 0) return;

    setIsImporting(true);
    setImportStatus('Updating database...');

    let updatedCount = 0;
    let addedCount = 0;
    let errorCount = 0;

    for (const row of selected) {
      if (row.matchedAttorney) {
        // Increment referral count
        const { error } = await supabase
          .from('attorneys')
          .update({ referral_count: (row.matchedAttorney.referral_count || 0) + 1 })
          .eq('id', row.matchedAttorney.id);
        if (error) errorCount++;
        else updatedCount++;
      } else {
        // Add new attorney
        const nameParts = row.name.split(/\s+/);
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        const { error } = await supabase.from('attorneys').insert({
          first_name: firstName,
          last_name: lastName,
          email: row.email || null,
          firm_name: row.firm || null,
          referral_count: 1,
          cards_sent: 0,
          needs_review: true,
          full_name_search: row.name || `${firstName} ${lastName}`.trim(),
        });
        if (error) errorCount++;
        else addedCount++;
      }
    }

    setImportStatus(`Done! Updated ${updatedCount} referrals, added ${addedCount} new attorneys${errorCount > 0 ? `, ${errorCount} errors` : ''}.`);
    setIsImporting(false);
    setImportComplete(true);
    fetchAttorneys();
  };

  // ---------------------------------------------------------------------------
  // COMPUTED
  // ---------------------------------------------------------------------------

  const reviewCount = attorneys.filter(a => a.needs_review).length;
  const needCardsCount = attorneys.filter(a => getCardsNeeded(a.referral_count, a.cards_sent) > 0).length;

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  const inputClass = 'w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-[#77DD77] placeholder-white/30';
  const thClass = 'px-3 py-3 text-xs font-bold text-white/60 uppercase tracking-wider cursor-pointer select-none whitespace-nowrap hover:text-white/80 transition-colors';

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-2 items-center">
        {(['all', 'review', 'search', 'import'] as SubTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              subTab === tab
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80'
            }`}
          >
            {tab === 'all' && `📋 All (${totalCount})`}
            {tab === 'review' && <>⚠️ Review {reviewCount > 0 && <span className="ml-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">{reviewCount}</span>}</>}
            {tab === 'search' && '🔍 Search & Edit'}
            {tab === 'import' && '📥 Import'}
          </button>
        ))}

        <div className="flex-1" />

        {/* Action buttons */}
        <button onClick={() => setShowAddForm(true)} className="px-3 py-2 bg-[#77DD77] text-[#1C1C1C] rounded-lg text-sm font-semibold hover:bg-[#88EE88] transition-colors">
          + Add Attorney
        </button>
        <button onClick={printLabels} className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-500 transition-colors">
          🏷️ Print Labels
        </button>
        <button onClick={() => openLetterModal()} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors">
          ✉️ Print Letter
        </button>
        <button onClick={exportCSV} className="px-3 py-2 bg-white/10 text-white rounded-lg text-sm font-semibold hover:bg-white/20 transition-colors">
          📊 Export CSV
        </button>
      </div>

      {/* ================================================================ */}
      {/* ALL ATTORNEYS TAB */}
      {/* ================================================================ */}
      {subTab === 'all' && (
        <>
          {/* Filters */}
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs text-white/50 mb-1">Filter</label>
                <input
                  type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Filter by name, email, or firm..."
                  className={inputClass}
                />
              </div>
              <div className="w-28">
                <label className="block text-xs text-white/50 mb-1">State</label>
                <select value={stateFilter} onChange={e => setStateFilter(e.target.value)} className={inputClass}>
                  <option value="">All</option>
                  {STATE_LIST.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer pb-1">
                <input type="checkbox" checked={needsCardsOnly} onChange={e => setNeedsCardsOnly(e.target.checked)} className="w-4 h-4 rounded" />
                <span className="text-sm text-white/70">Needs cards ({needCardsCount})</span>
              </label>
            </div>
          </div>

          <div className="text-xs text-white/40 mb-1">Showing {sortedAttorneys.length} of {totalCount}</div>

          {/* Table */}
          <div className="bg-white/5 rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-10 text-center text-white/40">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th onClick={() => handleSort('name')} className={`${thClass} text-left pl-4`}>Name <SortIcon field="name" /></th>
                      <th onClick={() => handleSort('email')} className={`${thClass} text-left`}>Email <SortIcon field="email" /></th>
                      <th onClick={() => handleSort('state')} className={`${thClass} text-center w-16`}>State <SortIcon field="state" /></th>
                      <th onClick={() => handleSort('cards_sent')} className={`${thClass} text-center w-24`}>Cards <SortIcon field="cards_sent" /></th>
                      <th onClick={() => handleSort('referral_count')} className={`${thClass} text-center w-24`}>Referrals <SortIcon field="referral_count" /></th>
                      <th onClick={() => handleSort('cards_needed')} className={`${thClass} text-center w-24`}>Needed <SortIcon field="cards_needed" /></th>
                      <th className="px-3 py-3 text-xs font-bold text-white/60 uppercase text-center w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAttorneys.map((a, idx) => {
                      const needed = getCardsNeeded(a.referral_count, a.cards_sent);
                      return (
                        <tr key={a.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${a.needs_review ? 'bg-yellow-500/10' : ''}`}>
                          <td className="px-4 py-3 text-sm text-white">{getDisplayName(a)}</td>
                          <td className="px-3 py-3 text-xs text-white/50">{a.email || '-'}</td>
                          <td className="px-3 py-3 text-sm text-center text-white/50">{a.state || '-'}</td>
                          <td className="px-3 py-3 text-center">
                            {editingId === a.id ? (
                              <input type="number" value={editValue} onChange={e => setEditValue(e.target.value)}
                                onBlur={() => updateCardsSent(a.id, parseInt(editValue) || 0)}
                                onKeyDown={e => { if (e.key === 'Enter') updateCardsSent(a.id, parseInt(editValue) || 0); if (e.key === 'Escape') setEditingId(null); }}
                                className="w-16 px-2 py-1 bg-white/20 border-2 border-[#77DD77] rounded text-center text-white text-sm"
                                autoFocus
                              />
                            ) : (
                              <span onClick={() => { setEditingId(a.id); setEditValue(String(a.cards_sent)); }}
                                className="cursor-pointer px-2 py-1 rounded bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
                                title="Click to edit"
                              >{a.cards_sent}</span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-center text-sm text-white/70">{a.referral_count}</td>
                          <td className="px-3 py-3 text-center">
                            {needed > 0
                              ? <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-bold">{needed}</span>
                              : <span className="text-white/20 text-sm">0</span>
                            }
                          </td>
                          <td className="px-3 py-3 text-center">
                            <div className="flex gap-1 justify-center">
                              <button onClick={() => openEditModal(a)} className="px-2 py-1 bg-white/10 text-white/70 rounded text-xs hover:bg-white/20 transition-colors" title="Edit">✏️</button>
                              <button onClick={() => openLetterModal(a)} className="px-2 py-1 bg-white/10 text-white/70 rounded text-xs hover:bg-white/20 transition-colors" title="Print letter">✉️</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {sortedAttorneys.length === 0 && !loading && (
                      <tr><td colSpan={7} className="p-10 text-center text-white/30">No attorneys match filters</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ================================================================ */}
      {/* REVIEW TAB */}
      {/* ================================================================ */}
      {subTab === 'review' && (
        <div className="bg-white/5 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-white/40">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-3 py-3 text-left text-xs font-bold text-white/60 uppercase w-44">Name</th>
                    <th className="px-3 py-3 text-left text-xs font-bold text-white/60 uppercase w-48">Firm</th>
                    <th className="px-3 py-3 text-left text-xs font-bold text-white/60 uppercase w-48">Email</th>
                    <th className="px-3 py-3 text-left text-xs font-bold text-white/60 uppercase">Address</th>
                    <th className="px-3 py-3 text-left text-xs font-bold text-white/60 uppercase w-36">City</th>
                    <th className="px-3 py-3 text-center text-xs font-bold text-white/60 uppercase w-12">ST</th>
                    <th className="px-3 py-3 text-center text-xs font-bold text-white/60 uppercase w-20">Zip</th>
                    <th className="px-3 py-3 text-center text-xs font-bold text-white/60 uppercase w-16">Done</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAttorneys.filter(a => a.needs_review).map(a => (
                    <tr key={a.id} className="border-b border-white/5 bg-yellow-500/5">
                      <td className="px-3 py-2">
                        <input type="text" defaultValue={getDisplayName(a)} onBlur={e => {
                          const parts = e.target.value.trim().split(' ');
                          updateField(a.id, 'first_name', parts[0] || '');
                          updateField(a.id, 'last_name', parts.slice(1).join(' ') || '');
                        }} className={inputClass} />
                      </td>
                      <td className="px-3 py-2">
                        <input type="text" defaultValue={a.firm_name || ''} onBlur={e => updateField(a.id, 'firm_name', e.target.value)} placeholder="Firm" className={inputClass} />
                      </td>
                      <td className="px-3 py-2">
                        <input type="text" defaultValue={a.email || ''} onBlur={e => updateField(a.id, 'email', e.target.value)} placeholder="Email" className={`${inputClass} text-xs`} />
                      </td>
                      <td className="px-3 py-2">
                        <input type="text" defaultValue={a.address || ''} onBlur={e => updateField(a.id, 'address', e.target.value)} placeholder="Address" className={inputClass} />
                      </td>
                      <td className="px-3 py-2">
                        <input type="text" defaultValue={a.city || ''} onBlur={e => updateField(a.id, 'city', e.target.value)} placeholder="City" className={inputClass} />
                      </td>
                      <td className="px-1 py-2">
                        <input type="text" defaultValue={a.state || ''} onBlur={e => updateField(a.id, 'state', e.target.value.toUpperCase())} maxLength={2} className={`${inputClass} text-center`} />
                      </td>
                      <td className="px-3 py-2">
                        <input type="text" defaultValue={a.zip || ''} onBlur={e => updateField(a.id, 'zip', e.target.value)} className={`${inputClass} text-center`} />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button onClick={() => markReviewed(a.id)} className="px-3 py-1 bg-[#77DD77] text-[#1C1C1C] rounded text-xs font-bold hover:bg-[#88EE88] transition-colors">✓</button>
                      </td>
                    </tr>
                  ))}
                  {sortedAttorneys.filter(a => a.needs_review).length === 0 && (
                    <tr><td colSpan={8} className="p-10 text-center text-white/30">No attorneys need review</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* SEARCH TAB */}
      {/* ================================================================ */}
      {subTab === 'search' && (
        <div className="bg-white/5 rounded-lg p-4">
          <div className="mb-4">
            <input
              type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name, firm, or email..."
              className="w-full max-w-md px-4 py-3 bg-white/10 border-2 border-white/20 rounded-lg text-white text-base focus:outline-none focus:border-[#77DD77] placeholder-white/30"
              autoFocus
            />
            {searching && <span className="ml-3 text-white/40 text-sm">Searching...</span>}
          </div>

          {searchResults.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-3 py-3 text-left text-xs font-bold text-white/60 uppercase">Name</th>
                    <th className="px-3 py-3 text-left text-xs font-bold text-white/60 uppercase">Firm</th>
                    <th className="px-3 py-3 text-left text-xs font-bold text-white/60 uppercase">Email</th>
                    <th className="px-3 py-3 text-center text-xs font-bold text-white/60 uppercase w-16">State</th>
                    <th className="px-3 py-3 text-center text-xs font-bold text-white/60 uppercase w-20">Referrals</th>
                    <th className="px-3 py-3 text-center text-xs font-bold text-white/60 uppercase w-20">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((a, idx) => (
                    <tr key={a.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${a.needs_review ? 'bg-yellow-500/10' : ''}`}>
                      <td className="px-3 py-3 text-sm text-white font-medium">{getDisplayName(a)}</td>
                      <td className="px-3 py-3 text-sm text-white/50">{a.firm_name || '-'}</td>
                      <td className="px-3 py-3 text-xs text-white/50">{a.email || '-'}</td>
                      <td className="px-3 py-3 text-sm text-center text-white/50">{a.state || '-'}</td>
                      <td className="px-3 py-3 text-center text-sm font-bold text-white">{a.referral_count}</td>
                      <td className="px-3 py-3 text-center">
                        <button onClick={() => openEditModal(a)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-500 transition-colors">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : searchQuery.length >= 2 ? (
            <div className="p-10 text-center text-white/30">No results found</div>
          ) : (
            <div className="p-10 text-center text-white/30">Enter at least 2 characters to search</div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* IMPORT TAB */}
      {/* ================================================================ */}
      {subTab === 'import' && (
        <div className="space-y-4">
          <div className="bg-white/5 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-1">Import Attorney Referrals</h3>
            <p className="text-white/50 text-sm mb-4">Upload a CSV from Mac Mail export or paste a list of attorney emails/names. Matched attorneys get +1 referral. New attorneys are added and flagged for review.</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CSV Upload */}
              <div>
                <h4 className="text-sm font-semibold text-white/80 mb-2">📁 Upload CSV</h4>
                <p className="text-xs text-white/40 mb-3">Columns auto-detected: email, name, first_name, last_name, firm</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt,.tsv"
                  onChange={handleCSVUpload}
                  className="block w-full text-sm text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 file:cursor-pointer"
                />
              </div>

              {/* Text Paste */}
              <div>
                <h4 className="text-sm font-semibold text-white/80 mb-2">📝 Paste List</h4>
                <p className="text-xs text-white/40 mb-3">One email or attorney name per line</p>
                <textarea
                  value={importText}
                  onChange={e => setImportText(e.target.value)}
                  placeholder="john.smith@lawfirm.com&#10;Jane Doe&#10;attorney@example.com"
                  rows={5}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-[#77DD77] placeholder-white/20 resize-none"
                />
                <button onClick={handleTextImport} disabled={!importText.trim()}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  Process List
                </button>
              </div>
            </div>
          </div>

          {/* Status */}
          {importStatus && (
            <div className={`p-3 rounded-lg text-sm font-medium ${importComplete ? 'bg-[#77DD77]/20 text-[#77DD77]' : 'bg-blue-500/20 text-blue-300'}`}>
              {importStatus}
            </div>
          )}

          {/* Import Preview Table */}
          {importData.length > 0 && !importComplete && (
            <div className="bg-white/5 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="text-sm text-white/70">
                  <span className="text-[#77DD77] font-semibold">{importData.filter(r => r.selected && r.matchType !== 'new').length}</span> will update &nbsp;|&nbsp;
                  <span className="text-blue-400 font-semibold">{importData.filter(r => r.selected && r.matchType === 'new').length}</span> will be added &nbsp;|&nbsp;
                  <span className="text-white/40">{importData.filter(r => !r.selected).length}</span> skipped
                </div>
                <button onClick={commitImport} disabled={isImporting || importData.filter(r => r.selected).length === 0}
                  className="px-5 py-2 bg-[#77DD77] text-[#1C1C1C] rounded-lg font-bold text-sm hover:bg-[#88EE88] disabled:opacity-30 transition-colors">
                  {isImporting ? 'Updating...' : 'Confirm Import'}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-3 py-2 text-center w-10"><input type="checkbox"
                        checked={importData.every(r => r.selected)}
                        onChange={e => setImportData(prev => prev.map(r => ({ ...r, selected: e.target.checked })))}
                        className="w-4 h-4"
                      /></th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-white/60 uppercase">Input</th>
                      <th className="px-3 py-2 text-left text-xs font-bold text-white/60 uppercase">Match</th>
                      <th className="px-3 py-2 text-center text-xs font-bold text-white/60 uppercase w-28">Type</th>
                      <th className="px-3 py-2 text-center text-xs font-bold text-white/60 uppercase w-24">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importData.map((row, idx) => (
                      <tr key={idx} className={`border-b border-white/5 ${!row.selected ? 'opacity-30' : ''}`}>
                        <td className="px-3 py-2 text-center">
                          <input type="checkbox" checked={row.selected} onChange={() => toggleImportRow(idx)} className="w-4 h-4" />
                        </td>
                        <td className="px-3 py-2 text-sm text-white">
                          {row.email && <div className="text-xs text-white/50">{row.email}</div>}
                          {row.name && <div>{row.name}</div>}
                          {row.firm && <div className="text-xs text-white/40">{row.firm}</div>}
                        </td>
                        <td className="px-3 py-2 text-sm text-white/70">
                          {row.matchedAttorney
                            ? <>{getDisplayName(row.matchedAttorney)} <span className="text-xs text-white/40">({row.matchedAttorney.referral_count} refs)</span></>
                            : <span className="text-white/30">New attorney</span>
                          }
                        </td>
                        <td className="px-3 py-2 text-center">
                          {row.matchType === 'exact-email' && <span className="px-2 py-0.5 bg-[#77DD77]/20 text-[#77DD77] rounded text-xs font-semibold">Email Match</span>}
                          {row.matchType === 'fuzzy-name' && <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs font-semibold">Name Match</span>}
                          {row.matchType === 'new' && <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs font-semibold">New</span>}
                        </td>
                        <td className="px-3 py-2 text-center text-xs text-white/50">
                          {row.matchedAttorney ? '+1 referral' : 'Add + Review'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* EDIT MODAL */}
      {/* ================================================================ */}
      {selectedAttorney && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#2A2A2A] border border-white/10 rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-auto">
            <div className="p-5 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">Edit Attorney</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1">First Name</label>
                  <input type="text" value={editForm.first_name || ''} onChange={e => setEditForm({ ...editForm, first_name: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1">Last Name</label>
                  <input type="text" value={editForm.last_name || ''} onChange={e => setEditForm({ ...editForm, last_name: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1">Firm Name</label>
                <input type="text" value={editForm.firm_name || ''} onChange={e => setEditForm({ ...editForm, firm_name: e.target.value })} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1">Email</label>
                  <input type="email" value={editForm.email || ''} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1">Certificate Email</label>
                  <input type="email" value={editForm.certificate_email || ''} onChange={e => setEditForm({ ...editForm, certificate_email: e.target.value })} placeholder="If different from main" className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1">Phone</label>
                <input type="text" value={editForm.phone || ''} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1">Address</label>
                <input type="text" value={editForm.address || ''} onChange={e => setEditForm({ ...editForm, address: e.target.value })} className={inputClass} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1">City</label>
                  <input type="text" value={editForm.city || ''} onChange={e => setEditForm({ ...editForm, city: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1">State</label>
                  <select value={editForm.state || ''} onChange={e => setEditForm({ ...editForm, state: e.target.value })} className={inputClass}>
                    <option value="">Select</option>
                    {STATE_LIST.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1">ZIP</label>
                  <input type="text" value={editForm.zip || ''} onChange={e => setEditForm({ ...editForm, zip: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1">Referral Count</label>
                  <input type="number" value={editForm.referral_count || 0} onChange={e => setEditForm({ ...editForm, referral_count: parseInt(e.target.value) || 0 })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1">Cards Sent</label>
                  <input type="number" value={editForm.cards_sent || 0} onChange={e => setEditForm({ ...editForm, cards_sent: parseInt(e.target.value) || 0 })} className={inputClass} />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editForm.needs_review || false} onChange={e => setEditForm({ ...editForm, needs_review: e.target.checked })} className="w-4 h-4" />
                <span className="text-sm text-white/60">Needs Review</span>
              </label>
            </div>
            <div className="p-5 border-t border-white/10 flex justify-between">
              <div className="flex gap-2">
                <button onClick={deleteAttorney} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-semibold hover:bg-red-500/30 transition-colors">Delete</button>
                <button onClick={mergeWithAnother} className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm font-semibold hover:bg-yellow-500/30 transition-colors">Merge</button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setSelectedAttorney(null)} className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm font-semibold hover:bg-white/20 transition-colors">Cancel</button>
                <button onClick={saveAttorney} disabled={saving} className="px-4 py-2 bg-[#77DD77] text-[#1C1C1C] rounded-lg text-sm font-bold hover:bg-[#88EE88] disabled:opacity-50 transition-colors">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* LETTER MODAL */}
      {/* ================================================================ */}
      {showLetterModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#2A2A2A] border border-white/10 rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-5 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">Print Letter</h2>
            </div>
            <div className="p-5 space-y-5">
              {/* Template Selection */}
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-2">Letter Template</label>
                <div className="space-y-2">
                  <label className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer border transition-colors ${letterTemplate === 'standard' ? 'border-[#77DD77] bg-[#77DD77]/10' : 'border-white/10 hover:border-white/20'}`}>
                    <input type="radio" checked={letterTemplate === 'standard'} onChange={() => setLetterTemplate('standard')} className="mt-1" />
                    <div>
                      <div className="text-sm font-semibold text-white">Standard Thank You</div>
                      <div className="text-xs text-white/40">Gratitude + attorney notification process + cards enclosed</div>
                    </div>
                  </label>
                  <label className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer border transition-colors ${letterTemplate === 'claseparapadres' ? 'border-[#77DD77] bg-[#77DD77]/10' : 'border-white/10 hover:border-white/20'}`}>
                    <input type="radio" checked={letterTemplate === 'claseparapadres'} onChange={() => setLetterTemplate('claseparapadres')} className="mt-1" />
                    <div>
                      <div className="text-sm font-semibold text-white">Clase para Padres Introduction</div>
                      <div className="text-xs text-white/40">Gratitude + introduces claseparapadres.com for Spanish-speaking clients</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Target Selection */}
              {!singleLetterAttorney && (
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-2">Recipients</label>
                  <div className="space-y-2">
                    <label className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-colors ${letterTarget === 'needs-cards' ? 'border-[#77DD77] bg-[#77DD77]/10' : 'border-white/10 hover:border-white/20'}`}>
                      <input type="radio" checked={letterTarget === 'needs-cards'} onChange={() => setLetterTarget('needs-cards')} />
                      <div>
                        <span className="text-sm text-white">Attorneys needing cards</span>
                        <span className="ml-2 text-xs text-white/40">({getMailableAttorneys().length})</span>
                      </div>
                    </label>
                    <label className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-colors ${letterTarget === 'filtered' ? 'border-[#77DD77] bg-[#77DD77]/10' : 'border-white/10 hover:border-white/20'}`}>
                      <input type="radio" checked={letterTarget === 'filtered'} onChange={() => setLetterTarget('filtered')} />
                      <div>
                        <span className="text-sm text-white">All filtered attorneys with addresses</span>
                        <span className="ml-2 text-xs text-white/40">({sortedAttorneys.filter(a => a.address).length})</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {singleLetterAttorney && (
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-sm text-white font-medium">{getDisplayName(singleLetterAttorney)}</div>
                  <div className="text-xs text-white/40">{singleLetterAttorney.firm_name || ''}</div>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-white/10 flex gap-2 justify-end">
              <button onClick={() => { setShowLetterModal(false); setSingleLetterAttorney(null); }} className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm font-semibold hover:bg-white/20 transition-colors">Cancel</button>
              <button onClick={printLetters} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-500 transition-colors">
                Print {singleLetterAttorney ? 'Letter' : 'Letters'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* ADD ATTORNEY MODAL */}
      {/* ================================================================ */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#2A2A2A] border border-white/10 rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-auto">
            <div className="p-5 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">Add New Attorney</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1">First Name</label>
                  <input type="text" value={newAttorney.first_name} onChange={e => setNewAttorney({ ...newAttorney, first_name: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1">Last Name</label>
                  <input type="text" value={newAttorney.last_name} onChange={e => setNewAttorney({ ...newAttorney, last_name: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1">Firm Name</label>
                <input type="text" value={newAttorney.firm_name} onChange={e => setNewAttorney({ ...newAttorney, firm_name: e.target.value })} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1">Email</label>
                  <input type="email" value={newAttorney.email} onChange={e => setNewAttorney({ ...newAttorney, email: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1">Certificate Email</label>
                  <input type="email" value={newAttorney.certificate_email} onChange={e => setNewAttorney({ ...newAttorney, certificate_email: e.target.value })} placeholder="If different" className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1">Phone</label>
                <input type="text" value={newAttorney.phone} onChange={e => setNewAttorney({ ...newAttorney, phone: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1">Address</label>
                <input type="text" value={newAttorney.address} onChange={e => setNewAttorney({ ...newAttorney, address: e.target.value })} className={inputClass} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1">City</label>
                  <input type="text" value={newAttorney.city} onChange={e => setNewAttorney({ ...newAttorney, city: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1">State</label>
                  <select value={newAttorney.state} onChange={e => setNewAttorney({ ...newAttorney, state: e.target.value })} className={inputClass}>
                    <option value="">Select</option>
                    {STATE_LIST.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1">ZIP</label>
                  <input type="text" value={newAttorney.zip} onChange={e => setNewAttorney({ ...newAttorney, zip: e.target.value })} className={inputClass} />
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-white/10 flex gap-2 justify-end">
              <button onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm font-semibold hover:bg-white/20 transition-colors">Cancel</button>
              <button onClick={addNewAttorney} className="px-5 py-2 bg-[#77DD77] text-[#1C1C1C] rounded-lg text-sm font-bold hover:bg-[#88EE88] transition-colors">Add Attorney</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
