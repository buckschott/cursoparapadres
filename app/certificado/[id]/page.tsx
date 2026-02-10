'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// ============================================
// TYPES
// ============================================

interface Certificate {
  id: string;
  user_id: string;
  course_type: string;
  certificate_number: string;
  verification_code: string;
  participant_name: string;
  case_number: string | null;
  court_state: string | null;
  court_county: string | null;
  issued_at: string;
}

interface Profile {
  attorney_name: string | null;
  attorney_email: string | null;
}

// ============================================
// CONSTANTS
// ============================================

const CERTIFICATE_VALIDITY_MONTHS = 12;

const US_STATES = [
  { value: '', label: 'Seleccione un estado' },
  { value: 'Alabama', label: 'Alabama' },
  { value: 'Alaska', label: 'Alaska' },
  { value: 'Arizona', label: 'Arizona' },
  { value: 'Arkansas', label: 'Arkansas' },
  { value: 'California', label: 'California' },
  { value: 'Colorado', label: 'Colorado' },
  { value: 'Connecticut', label: 'Connecticut' },
  { value: 'Delaware', label: 'Delaware' },
  { value: 'Florida', label: 'Florida' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Hawaii', label: 'Hawaii' },
  { value: 'Idaho', label: 'Idaho' },
  { value: 'Illinois', label: 'Illinois' },
  { value: 'Indiana', label: 'Indiana' },
  { value: 'Iowa', label: 'Iowa' },
  { value: 'Kansas', label: 'Kansas' },
  { value: 'Kentucky', label: 'Kentucky' },
  { value: 'Louisiana', label: 'Louisiana' },
  { value: 'Maine', label: 'Maine' },
  { value: 'Maryland', label: 'Maryland' },
  { value: 'Massachusetts', label: 'Massachusetts' },
  { value: 'Michigan', label: 'Michigan' },
  { value: 'Minnesota', label: 'Minnesota' },
  { value: 'Mississippi', label: 'Mississippi' },
  { value: 'Missouri', label: 'Missouri' },
  { value: 'Montana', label: 'Montana' },
  { value: 'Nebraska', label: 'Nebraska' },
  { value: 'Nevada', label: 'Nevada' },
  { value: 'New Hampshire', label: 'New Hampshire' },
  { value: 'New Jersey', label: 'New Jersey' },
  { value: 'New Mexico', label: 'New Mexico' },
  { value: 'New York', label: 'New York' },
  { value: 'North Carolina', label: 'North Carolina' },
  { value: 'North Dakota', label: 'North Dakota' },
  { value: 'Ohio', label: 'Ohio' },
  { value: 'Oklahoma', label: 'Oklahoma' },
  { value: 'Oregon', label: 'Oregon' },
  { value: 'Pennsylvania', label: 'Pennsylvania' },
  { value: 'Rhode Island', label: 'Rhode Island' },
  { value: 'South Carolina', label: 'South Carolina' },
  { value: 'South Dakota', label: 'South Dakota' },
  { value: 'Tennessee', label: 'Tennessee' },
  { value: 'Texas', label: 'Texas' },
  { value: 'Utah', label: 'Utah' },
  { value: 'Vermont', label: 'Vermont' },
  { value: 'Virginia', label: 'Virginia' },
  { value: 'Washington', label: 'Washington' },
  { value: 'West Virginia', label: 'West Virginia' },
  { value: 'Wisconsin', label: 'Wisconsin' },
  { value: 'Wyoming', label: 'Wyoming' },
  { value: 'District of Columbia', label: 'District of Columbia' },
  { value: 'Puerto Rico', label: 'Puerto Rico' },
  { value: 'Guam', label: 'Guam' },
  { value: 'US Virgin Islands', label: 'US Virgin Islands' },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function isCertificateExpired(issuedAt: string): boolean {
  const issueDate = new Date(issuedAt);
  const expirationDate = new Date(issueDate);
  expirationDate.setMonth(expirationDate.getMonth() + CERTIFICATE_VALIDITY_MONTHS);
  return new Date() > expirationDate;
}

function getExpirationDate(issuedAt: string): Date {
  const issueDate = new Date(issuedAt);
  const expirationDate = new Date(issueDate);
  expirationDate.setMonth(expirationDate.getMonth() + CERTIFICATE_VALIDITY_MONTHS);
  return expirationDate;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function CertificadoPage() {
  const params = useParams();
  const id = params?.id as string;
  const supabase = createClient();
  
  // Page state
  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Edit form state (certificate fields)
  const [editCourtState, setEditCourtState] = useState('');
  const [editCourtCounty, setEditCourtCounty] = useState('');
  const [editCaseNumber, setEditCaseNumber] = useState('');
  
  // Edit form state (profile fields - attorney)
  const [editAttorneyName, setEditAttorneyName] = useState('');
  const [editAttorneyEmail, setEditAttorneyEmail] = useState('');

  // Computed values
  const isExpired = certificate ? isCertificateExpired(certificate.issued_at) : false;
  const expirationDate = certificate ? getExpirationDate(certificate.issued_at) : null;
  
  const courseDisplayName = certificate?.course_type === 'parenting'
    ? 'Clase de Crianza'
    : 'Clase de Coparentalidad';

  // ============================================
  // LOAD DATA
  // ============================================
  
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        // Check auth
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          window.location.href = '/iniciar-sesion';
          return;
        }
        
        // Load certificate (with user_id check for security)
        const { data: certData, error: certError } = await supabase
          .from('certificates')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();
        
        if (certError || !certData) {
          setError('Certificado no encontrado o no tiene acceso.');
          setLoading(false);
          return;
        }
        
        setCertificate(certData);
        
        // Initialize edit form with certificate data
        setEditCourtState(certData.court_state || '');
        setEditCourtCounty(certData.court_county || '');
        setEditCaseNumber(certData.case_number || '');
        
        // Load profile for attorney info
        const { data: profileData } = await supabase
          .from('profiles')
          .select('attorney_name, attorney_email')
          .eq('id', user.id)
          .single();
        
        if (profileData) {
          setProfile(profileData);
          setEditAttorneyName(profileData.attorney_name || '');
          setEditAttorneyEmail(profileData.attorney_email || '');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading certificate:', err);
        setError('Ocurrió un error al cargar el certificado.');
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, supabase]);

  // ============================================
  // HANDLE SAVE
  // ============================================
  
  const handleSave = async () => {
    if (!certificate || isExpired) return;
    
    setSaving(true);
    setSaveSuccess(false);
    
    try {
      // Update certificate (court info)
      const { error: certError } = await supabase
        .from('certificates')
        .update({
          court_state: editCourtState || null,
          court_county: editCourtCounty.trim() || null,
          case_number: editCaseNumber.trim() || null,
        })
        .eq('id', certificate.id);
      
      if (certError) {
        throw new Error('Error al guardar información del caso');
      }
      
      // Update profile (attorney info)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            attorney_name: editAttorneyName.trim() || null,
            attorney_email: editAttorneyEmail.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
        
        if (profileError) {
          throw new Error('Error al guardar información del abogado');
        }
      }
      
      // Update local state
      setCertificate({
        ...certificate,
        court_state: editCourtState || null,
        court_county: editCourtCounty.trim() || null,
        case_number: editCaseNumber.trim() || null,
      });
      
      setProfile({
        attorney_name: editAttorneyName.trim() || null,
        attorney_email: editAttorneyEmail.trim() || null,
      });
      
      setSaveSuccess(true);
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
      
    } catch (err: any) {
      console.error('Save error:', err);
      alert(err.message || 'Error al guardar. Intente de nuevo.');
    }
    
    setSaving(false);
  };

  // ============================================
  // CANCEL EDIT
  // ============================================
  
  const handleCancel = () => {
    // Reset form to current values
    setEditCourtState(certificate?.court_state || '');
    setEditCourtCounty(certificate?.court_county || '');
    setEditCaseNumber(certificate?.case_number || '');
    setEditAttorneyName(profile?.attorney_name || '');
    setEditAttorneyEmail(profile?.attorney_email || '');
    setIsEditing(false);
  };

  // ============================================
  // LOADING STATE
  // ============================================
  
  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <svg className="w-full h-full animate-spin" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="40"
                fill="none" 
                stroke="rgba(255,255,255,0.1)" 
                strokeWidth="4"
              />
              <circle
                cx="50" cy="50" r="40"
                fill="none" 
                stroke="#77DD77" 
                strokeWidth="4"
                strokeLinecap="round" 
                strokeDasharray="60 191"
              />
            </svg>
          </div>
          <p className="text-white/60">Cargando certificado...</p>
        </div>
      </main>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================
  
  if (error || !certificate) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-[#FF9999]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#FF9999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Certificado No Encontrado</h1>
          <p className="text-white/60 mb-6">{error || 'No pudimos encontrar este certificado.'}</p>
          <Link
            href="/panel"
            className="inline-flex items-center gap-2 bg-[#7EC8E3] text-[#1C1C1C] px-6 py-3 rounded-xl font-bold hover:bg-[#9DD8F3] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al Panel
          </Link>
        </div>
      </main>
    );
  }

  // ============================================
  // EXPIRED STATE
  // ============================================
  
  if (isExpired) {
    return (
      <main className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-background border-b border-[#FFFFFF]/10 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
            <Link href="/panel" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Volver al Panel</span>
            </Link>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 md:px-6 py-12">
          <div className="bg-[#2A2A2A] rounded-2xl p-8 border border-white/10 text-center">
            {/* Expired icon */}
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2">Certificado Expirado</h1>
            <p className="text-white/60 mb-6">
              Este certificado expiró el {formatDate(expirationDate!.toISOString())}.
            </p>
            
            {/* Certificate details (read-only) */}
            <div className="bg-[#1C1C1C] rounded-xl p-4 mb-6 text-left">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-white/40">Certificado</p>
                  <p className="text-white font-mono">{certificate.certificate_number}</p>
                </div>
                <div>
                  <p className="text-white/40">Clase</p>
                  <p className="text-white">{courseDisplayName}</p>
                </div>
                <div>
                  <p className="text-white/40">Emitido</p>
                  <p className="text-white">{formatDate(certificate.issued_at)}</p>
                </div>
                <div>
                  <p className="text-white/40">Expiró</p>
                  <p className="text-white">{formatDate(expirationDate!.toISOString())}</p>
                </div>
              </div>
            </div>
            
            {/* Info box */}
            <div className="bg-[#7EC8E3]/10 border border-[#7EC8E3]/30 rounded-xl p-4 mb-6 text-left">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-[#7EC8E3] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-[#7EC8E3] font-medium">¿Necesita un nuevo certificado?</p>
                  <p className="text-[#7EC8E3]/80 text-sm mt-1">
                    Para obtener un nuevo certificado para un caso nuevo, debe inscribirse y completar la clase nuevamente.
                  </p>
                </div>
              </div>
            </div>
            
            <Link
              href="/#precios"
              className="inline-flex items-center justify-center gap-2 w-full bg-[#77DD77] text-[#1C1C1C] py-4 rounded-xl font-bold hover:bg-[#88EE88] transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Inscribirse de Nuevo
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ============================================
  // MAIN RENDER (Active Certificate)
  // ============================================
  
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-[#FFFFFF]/10 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <Link href="/panel" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Volver al Panel</span>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Success message */}
        {saveSuccess && (
          <div className="bg-[#77DD77]/15 border border-[#77DD77]/30 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-[#77DD77]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-[#77DD77] font-medium">Cambios guardados. Su certificado PDF se actualizará automáticamente.</p>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#77DD77] rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-[#1C1C1C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">¡Felicidades!</h1>
            </div>
            <p className="text-white/60">
              Ha completado exitosamente la {courseDisplayName}.
            </p>
          </div>
          
          {/* Download button */}
          <a
            href={`/api/certificate/${certificate.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#77DD77] text-[#1C1C1C] px-6 py-3 rounded-xl font-bold hover:bg-[#88EE88] transition-all hover:shadow-lg hover:shadow-[#77DD77]/25 active:scale-[0.98]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Descargar PDF
          </a>
        </div>

        {/* Certificate Details Card */}
        <div className="bg-[#2A2A2A] rounded-2xl border border-white/10 overflow-hidden mb-8">
          {/* Certificate header */}
          <div className="bg-[#77DD77]/10 border-b border-[#77DD77]/20 px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[#77DD77] font-medium text-sm">Certificado de Finalización</p>
                <p className="text-white font-mono text-lg font-bold">{certificate.certificate_number}</p>
              </div>
              <div className="text-right">
                <p className="text-white/50 text-sm">Código de Verificación</p>
                <p className="text-white font-mono font-bold">{certificate.verification_code}</p>
              </div>
            </div>
          </div>
          
          {/* Certificate content */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left column - Certificate info */}
              <div className="space-y-4">
                <div>
                  <p className="text-white/40 text-sm mb-1">Nombre en Certificado</p>
                  <p className="text-white font-medium">{certificate.participant_name}</p>
                  <p className="text-white/40 text-xs mt-1">
                    Para cambiar el nombre, contacte a <a href="mailto:hola@claseparapadres.com" className="text-[#7EC8E3] hover:underline">hola@claseparapadres.com</a>
                  </p>
                </div>
                
                <div>
                  <p className="text-white/40 text-sm mb-1">Clase Completada</p>
                  <p className="text-white font-medium">{courseDisplayName}</p>
                </div>
                
                <div className="flex gap-6">
                  <div>
                    <p className="text-white/40 text-sm mb-1">Fecha de Emisión</p>
                    <p className="text-white font-medium">{formatDate(certificate.issued_at)}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-sm mb-1">Válido Hasta</p>
                    <p className="text-white font-medium">{formatDate(expirationDate!.toISOString())}</p>
                  </div>
                </div>
              </div>
              
              {/* Right column - QR code */}
              <div className="flex flex-col items-center justify-center bg-white rounded-xl p-6">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&format=png&data=${encodeURIComponent(`https://claseparapadres.com/verificar/${certificate.verification_code}`)}`}
                  alt="Código QR de verificación"
                  className="w-32 h-32 mb-3"
                />
                <p className="text-gray-600 text-sm text-center">
                  Escanee para verificar<br />
                  <span className="text-gray-400 text-xs">{certificate.verification_code}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Editable Court Information */}
        <div className="bg-[#2A2A2A] rounded-2xl border border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-[#7EC8E3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Información del Caso
            </h2>
            
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 text-[#7EC8E3] hover:text-[#9DD8F3] text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Editar
              </button>
            )}
          </div>
          
          <div className="p-6">
            {isEditing ? (
              /* Edit Mode */
              <div className="space-y-6">
                {/* Court info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Estado</label>
                    <select
                      value={editCourtState}
                      onChange={(e) => setEditCourtState(e.target.value)}
                      className="w-full bg-[#1C1C1C] border border-white/20 rounded-lg px-4 py-3 text-white focus:border-[#7EC8E3] focus:outline-none focus:ring-1 focus:ring-[#7EC8E3] transition-colors"
                    >
                      {US_STATES.map(state => (
                        <option key={state.value} value={state.value}>{state.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Condado</label>
                    <input
                      type="text"
                      value={editCourtCounty}
                      onChange={(e) => setEditCourtCounty(e.target.value)}
                      placeholder="Ej: Harris County"
                      className="w-full bg-[#1C1C1C] border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:border-[#7EC8E3] focus:outline-none focus:ring-1 focus:ring-[#7EC8E3] transition-colors"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-white mb-2">Número de Caso</label>
                    <input
                      type="text"
                      value={editCaseNumber}
                      onChange={(e) => setEditCaseNumber(e.target.value)}
                      placeholder="Número de caso"
                      className="w-full bg-[#1C1C1C] border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:border-[#7EC8E3] focus:outline-none focus:ring-1 focus:ring-[#7EC8E3] transition-colors"
                    />
                  </div>
                </div>
                
                {/* Divider */}
                <div className="border-t border-white/10 pt-6">
                  <h3 className="text-sm font-medium text-white/60 mb-4">Información del Abogado (Opcional)</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Nombre del Abogado</label>
                      <input
                        type="text"
                        value={editAttorneyName}
                        onChange={(e) => setEditAttorneyName(e.target.value)}
                        placeholder="Nombre completo"
                        className="w-full bg-[#1C1C1C] border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:border-[#7EC8E3] focus:outline-none focus:ring-1 focus:ring-[#7EC8E3] transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Correo del Abogado</label>
                      <input
                        type="email"
                        value={editAttorneyEmail}
                        onChange={(e) => setEditAttorneyEmail(e.target.value)}
                        placeholder="abogado@ejemplo.com"
                        className="w-full bg-[#1C1C1C] border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:border-[#7EC8E3] focus:outline-none focus:ring-1 focus:ring-[#7EC8E3] transition-colors"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold transition-all ${
                      saving
                        ? 'bg-white/20 text-white/40 cursor-not-allowed'
                        : 'bg-[#77DD77] text-[#1C1C1C] hover:bg-[#88EE88] active:scale-[0.98]'
                    }`}
                  >
                    {saving ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Guardar Cambios
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="py-3 px-6 rounded-xl font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-white/40 text-sm mb-1">Estado</p>
                    <p className="text-white font-medium">{certificate.court_state || '—'}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-sm mb-1">Condado</p>
                    <p className="text-white font-medium">{certificate.court_county || '—'}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-sm mb-1">Número de Caso</p>
                    <p className="text-white font-medium">{certificate.case_number || '—'}</p>
                  </div>
                </div>
                
                <div className="border-t border-white/10 pt-4 mt-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-white/40 text-sm mb-1">Abogado</p>
                      <p className="text-white font-medium">{profile?.attorney_name || '—'}</p>
                    </div>
                    <div>
                      <p className="text-white/40 text-sm mb-1">Correo del Abogado</p>
                      <p className="text-white font-medium">{profile?.attorney_email || '—'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Verification link */}
        <div className="mt-8 text-center">
          <p className="text-white/40 text-sm mb-2">Enlace de verificación público:</p>
          <a
            href={`/verificar/${certificate.verification_code}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#7EC8E3] hover:underline text-sm break-all"
          >
            https://claseparapadres.com/verificar/{certificate.verification_code}
          </a>
        </div>
      </div>
    </main>
  );
}
