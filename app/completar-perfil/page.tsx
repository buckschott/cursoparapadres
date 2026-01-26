'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ============================================
// TYPES
// ============================================

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  legal_name: string | null;
  phone: string | null;
  mailing_address: string | null;
  case_number: string | null;
  court_county: string | null;
  court_state: string | null;
  attorney_name: string | null;
  attorney_email: string | null;
  profile_completed: boolean;
}

interface PassedExam {
  course_type: string;
  passed: boolean;
  score: number;
}

interface Certificate {
  id: string;
  course_type: string;
}

interface MatchedAttorney {
  id: string;
  first_name: string;
  last_name: string;
  firm_name: string | null;
  email: string | null;
  certificate_email: string | null;
}

// ============================================
// CONSTANTS
// ============================================

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
// MAIN COMPONENT
// ============================================

export default function CompletarPerfilPage() {
  const router = useRouter();
  const supabase = createClient();
  
  // Page state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // User data
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [passedExams, setPassedExams] = useState<PassedExam[]>([]);
  const [existingCertificates, setExistingCertificates] = useState<Certificate[]>([]);
  
  // Mode: 'pre-exam' (just saving profile) or 'post-exam' (creating certificate)
  const [mode, setMode] = useState<'pre-exam' | 'post-exam'>('pre-exam');
  const [courseTypeForCert, setCourseTypeForCert] = useState<string | null>(null);
  
  // Form state
  const [legalName, setLegalName] = useState('');
  const [courtState, setCourtState] = useState('');
  const [courtCounty, setCourtCounty] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [attorneyName, setAttorneyName] = useState('');
  const [attorneyEmail, setAttorneyEmail] = useState('');
  
  // Attorney matching
  const [matchedAttorneys, setMatchedAttorneys] = useState<MatchedAttorney[]>([]);
  const [selectedAttorney, setSelectedAttorney] = useState<MatchedAttorney | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showNameDropdown, setShowNameDropdown] = useState(false);
  const [showEmailDropdown, setShowEmailDropdown] = useState(false);
  const [activeSearchField, setActiveSearchField] = useState<'name' | 'email' | null>(null);

  // ============================================
  // LOAD DATA
  // ============================================
  
  useEffect(() => {
    const loadData = async () => {
      try {
        // Check auth
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          window.location.href = '/iniciar-sesion';
          return;
        }
        
        setUserId(user.id);
        
        // Load profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError || !profileData) {
          setError('No pudimos cargar su perfil. Por favor, intente de nuevo.');
          setLoading(false);
          return;
        }
        
        setProfile(profileData);
        
        // Pre-fill form with existing data
        setLegalName(profileData.legal_name || '');
        setCourtState(profileData.court_state || '');
        setCourtCounty(profileData.court_county || '');
        setCaseNumber(profileData.case_number || '');
        setAttorneyName(profileData.attorney_name || '');
        setAttorneyEmail(profileData.attorney_email || '');
        
        // Check for passed exams
        const { data: examData } = await supabase
          .from('exam_attempts')
          .select('passed, score, purchase_id, purchases!inner(course_type)')
          .eq('user_id', user.id)
          .eq('passed', true);
        
        const passed: PassedExam[] = examData?.map((exam: any) => ({
          course_type: exam.purchases.course_type,
          passed: exam.passed,
          score: exam.score,
        })) || [];
        
        setPassedExams(passed);
        
        // Check for existing certificates
        const { data: certData } = await supabase
          .from('certificates')
          .select('id, course_type')
          .eq('user_id', user.id);
        
        setExistingCertificates(certData || []);
        
        // Determine mode: post-exam if user has passed an exam without a certificate
        const examWithoutCert = passed.find(exam => 
          !certData?.some(cert => cert.course_type === exam.course_type)
        );
        
        if (examWithoutCert) {
          setMode('post-exam');
          setCourseTypeForCert(examWithoutCert.course_type);
        } else {
          setMode('pre-exam');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Ocurrió un error al cargar sus datos.');
        setLoading(false);
      }
    };
    
    loadData();
  }, [supabase]);

  // ============================================
  // ATTORNEY SEARCH (shared for both fields)
  // ============================================
  
  const searchAttorneys = async (query: string, field: 'name' | 'email') => {
    if (query.length < 2) {
      setMatchedAttorneys([]);
      setShowNameDropdown(false);
      setShowEmailDropdown(false);
      return;
    }
    
    setIsSearching(true);
    setActiveSearchField(field);
    
    try {
      const response = await fetch(`/api/attorney-match?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setMatchedAttorneys(data.attorneys || []);
        
        if (data.attorneys?.length > 0) {
          if (field === 'name') {
            setShowNameDropdown(true);
            setShowEmailDropdown(false);
          } else {
            setShowEmailDropdown(true);
            setShowNameDropdown(false);
          }
        } else {
          setShowNameDropdown(false);
          setShowEmailDropdown(false);
        }
      }
    } catch (err) {
      console.error('Attorney search error:', err);
    }
    
    setIsSearching(false);
  };

  // ============================================
  // DEBOUNCED SEARCH FOR NAME FIELD
  // ============================================
  
  useEffect(() => {
    if (selectedAttorney) return;
    
    const debounce = setTimeout(() => {
      if (attorneyName.length >= 2) {
        searchAttorneys(attorneyName, 'name');
      } else {
        setMatchedAttorneys([]);
        setShowNameDropdown(false);
      }
    }, 300);
    
    return () => clearTimeout(debounce);
  }, [attorneyName, selectedAttorney]);

  // ============================================
  // DEBOUNCED SEARCH FOR EMAIL FIELD
  // ============================================
  
  useEffect(() => {
    if (selectedAttorney) return;
    
    const debounce = setTimeout(() => {
      if (attorneyEmail.length >= 2) {
        searchAttorneys(attorneyEmail, 'email');
      } else {
        setMatchedAttorneys([]);
        setShowEmailDropdown(false);
      }
    }, 300);
    
    return () => clearTimeout(debounce);
  }, [attorneyEmail, selectedAttorney]);

  // ============================================
  // SELECT ATTORNEY
  // ============================================
  
  const handleSelectAttorney = (attorney: MatchedAttorney) => {
    const emailToUse = attorney.certificate_email || attorney.email || '';
    
    setSelectedAttorney(attorney);
    setAttorneyName(`${attorney.first_name} ${attorney.last_name}`);
    setAttorneyEmail(emailToUse);
    setShowNameDropdown(false);
    setShowEmailDropdown(false);
    setMatchedAttorneys([]);
  };

  // ============================================
  // HANDLE NAME CHANGE
  // ============================================
  
  const handleAttorneyNameChange = (value: string) => {
    setAttorneyName(value);
    if (selectedAttorney && value !== `${selectedAttorney.first_name} ${selectedAttorney.last_name}`) {
      setSelectedAttorney(null);
    }
  };

  // ============================================
  // HANDLE EMAIL CHANGE
  // ============================================
  
  const handleAttorneyEmailChange = (value: string) => {
    setAttorneyEmail(value);
    if (selectedAttorney) {
      const selectedEmail = selectedAttorney.certificate_email || selectedAttorney.email || '';
      if (value !== selectedEmail) {
        setSelectedAttorney(null);
      }
    }
  };

  // ============================================
  // FORM VALIDATION
  // ============================================
  
  const isFormValid = () => {
    if (!legalName.trim()) return false;
    
    if (mode === 'post-exam') {
      if (!courtState) return false;
      if (!courtCounty.trim()) return false;
    }
    
    return true;
  };

  // ============================================
  // GENERATE CERTIFICATE NUMBER
  // ============================================
  
  const generateCertificateNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `PKF-${year}-${random}`;
  };
  
  const generateVerificationCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  // ============================================
  // HANDLE SUBMIT
  // ============================================
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid() || !userId) return;
    
    setSaving(true);
    setError(null);
    
    try {
      const profileUpdate = {
        legal_name: legalName.trim(),
        court_state: courtState || null,
        court_county: courtCounty.trim() || null,
        case_number: caseNumber.trim() || null,
        attorney_name: attorneyName.trim() || null,
        attorney_email: attorneyEmail.trim() || null,
        attorney_id: selectedAttorney?.id || null,
        profile_completed: true,
        updated_at: new Date().toISOString(),
      };
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', userId);
      
      if (profileError) {
        throw new Error('Error al guardar su perfil');
      }
      
      if (mode === 'post-exam' && courseTypeForCert) {
        const certificateNumber = generateCertificateNumber();
        const verificationCode = generateVerificationCode();
        
        const { data: newCert, error: certError } = await supabase
          .from('certificates')
          .insert({
            user_id: userId,
            course_type: courseTypeForCert,
            certificate_number: certificateNumber,
            verification_code: verificationCode,
            participant_name: legalName.trim(),
            case_number: caseNumber.trim() || null,
            court_state: courtState || null,
            court_county: courtCounty.trim() || null,
            issued_at: new Date().toISOString(),
          })
          .select('id')
          .single();
        
        if (certError) {
          throw new Error('Error al crear su certificado');
        }
        
        await supabase
          .from('course_progress')
          .update({ completed_at: new Date().toISOString() })
          .eq('user_id', userId)
          .eq('course_type', courseTypeForCert);
        
        try {
          await fetch('/api/send-certificate-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              certificateId: newCert.id,
              courseType: courseTypeForCert,
            }),
          });
          
          if (attorneyEmail.trim()) {
            await fetch('/api/send-attorney-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                certificateId: newCert.id,
                courseType: courseTypeForCert,
              }),
            });
          }
        } catch (emailErr) {
          console.error('Email send error:', emailErr);
        }
        
        setSuccess(true);
        setTimeout(() => {
          router.push(`/certificado/${newCert.id}`);
        }, 1500);
        
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/panel');
        }, 1500);
      }
      
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || 'Ocurrió un error. Por favor, intente de nuevo.');
      setSaving(false);
    }
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
                stroke="#7EC8E3" 
                strokeWidth="4"
                strokeLinecap="round" 
                strokeDasharray="60 191"
              />
            </svg>
          </div>
          <p className="text-white/60">Cargando...</p>
        </div>
      </main>
    );
  }

  // ============================================
  // SUCCESS STATE
  // ============================================
  
  if (success) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 bg-[#77DD77] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-[#1C1C1C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {mode === 'post-exam' ? '¡Certificado Generado!' : '¡Perfil Guardado!'}
          </h2>
          <p className="text-white/60">
            {mode === 'post-exam' 
              ? 'Redirigiendo a su certificado...'
              : 'Redirigiendo a su panel...'}
          </p>
        </div>
      </main>
    );
  }

  // ============================================
  // FORM RENDER
  // ============================================
  
  const courseDisplayName = courseTypeForCert === 'parenting' 
    ? 'Clase de Crianza' 
    : 'Clase de Coparentalidad';

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-[#FFFFFF]/10 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <Link href="/panel" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Volver al Panel</span>
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {mode === 'post-exam' ? 'Complete su Información' : 'Complete su Perfil'}
          </h1>
          <p className="text-white/60">
            {mode === 'post-exam' 
              ? `Ingrese los datos para generar su certificado de la ${courseDisplayName}.`
              : 'Complete su información ahora para ahorrar tiempo cuando termine su clase.'}
          </p>
        </div>

        {/* Post-exam success banner */}
        {mode === 'post-exam' && (
          <div className="bg-[#77DD77]/15 border border-[#77DD77]/30 rounded-xl p-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#77DD77] rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[#1C1C1C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-[#77DD77]">¡Examen Aprobado!</p>
                <p className="text-[#77DD77]/80 text-sm">
                  Complete el formulario abajo para generar su certificado oficial.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-[#FF9999]/15 border border-[#FF9999]/30 rounded-xl p-4 mb-8">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-[#FF9999] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[#FF9999]">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <section className="bg-background rounded-2xl p-6 border border-[#FFFFFF]/15 shadow-xl shadow-black/40">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#7EC8E3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Información Personal
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="legalName" className="block text-sm font-medium text-white mb-2">
                  Nombre Legal Completo <span className="text-[#FF9999]">*</span>
                </label>
                <input
                  type="text"
                  id="legalName"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  placeholder="Como aparece en documentos oficiales"
                  className="w-full bg-[#1C1C1C] border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:border-[#7EC8E3] focus:outline-none focus:ring-1 focus:ring-[#7EC8E3] transition-colors"
                  required
                />
                <p className="text-white/50 text-xs mt-2">
                  Este nombre aparecerá en su certificado oficial.
                </p>
              </div>
            </div>
          </section>

          {/* Court Information */}
          <section className="bg-background rounded-2xl p-6 border border-[#FFFFFF]/15 shadow-xl shadow-black/40">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#7EC8E3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Información del Caso
              {mode === 'pre-exam' && <span className="text-white/40 text-sm font-normal ml-2">(Opcional)</span>}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="courtState" className="block text-sm font-medium text-white mb-2">
                  Estado {mode === 'post-exam' && <span className="text-[#FF9999]">*</span>}
                </label>
                <select
                  id="courtState"
                  value={courtState}
                  onChange={(e) => setCourtState(e.target.value)}
                  className="w-full bg-[#1C1C1C] border border-white/20 rounded-lg px-4 py-3 text-white focus:border-[#7EC8E3] focus:outline-none focus:ring-1 focus:ring-[#7EC8E3] transition-colors"
                  required={mode === 'post-exam'}
                >
                  {US_STATES.map(state => (
                    <option key={state.value} value={state.value}>{state.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="courtCounty" className="block text-sm font-medium text-white mb-2">
                  Condado {mode === 'post-exam' && <span className="text-[#FF9999]">*</span>}
                </label>
                <input
                  type="text"
                  id="courtCounty"
                  value={courtCounty}
                  onChange={(e) => setCourtCounty(e.target.value)}
                  placeholder="Ej: Harris County"
                  className="w-full bg-[#1C1C1C] border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:border-[#7EC8E3] focus:outline-none focus:ring-1 focus:ring-[#7EC8E3] transition-colors"
                  required={mode === 'post-exam'}
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="caseNumber" className="block text-sm font-medium text-white mb-2">
                  Número de Caso
                </label>
                <input
                  type="text"
                  id="caseNumber"
                  value={caseNumber}
                  onChange={(e) => setCaseNumber(e.target.value)}
                  placeholder="Si lo conoce"
                  className="w-full bg-[#1C1C1C] border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:border-[#7EC8E3] focus:outline-none focus:ring-1 focus:ring-[#7EC8E3] transition-colors"
                />
                <p className="text-white/50 text-xs mt-2">
                  Puede agregar o actualizar este dato más tarde si no lo tiene ahora.
                </p>
              </div>
            </div>
          </section>

          {/* Attorney Information */}
          <section className="bg-background rounded-2xl p-6 border border-[#FFFFFF]/15 shadow-xl shadow-black/40">
            <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#7EC8E3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Información del Abogado
              <span className="text-white/40 text-sm font-normal">(Opcional)</span>
            </h2>
            <p className="text-white/50 text-sm mb-6">
              Si proporciona el correo de su abogado, le enviaremos automáticamente una copia de su certificado. Puede buscar por nombre o correo electrónico.
            </p>
            
            <div className="space-y-4">
              {/* Attorney Name Field */}
              <div className="relative">
                <label htmlFor="attorneyName" className="block text-sm font-medium text-white mb-2">
                  Nombre del Abogado
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="attorneyName"
                    value={attorneyName}
                    onChange={(e) => handleAttorneyNameChange(e.target.value)}
                    onFocus={() => matchedAttorneys.length > 0 && activeSearchField === 'name' && setShowNameDropdown(true)}
                    onBlur={() => setTimeout(() => setShowNameDropdown(false), 200)}
                    placeholder="Comience a escribir para buscar"
                    className="w-full bg-[#1C1C1C] border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:border-[#7EC8E3] focus:outline-none focus:ring-1 focus:ring-[#7EC8E3] transition-colors"
                    autoComplete="off"
                  />
                  {isSearching && activeSearchField === 'name' && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <svg className="w-5 h-5 text-white/40 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Name Search Dropdown */}
                {showNameDropdown && matchedAttorneys.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-[#2A2A2A] border border-white/20 rounded-lg shadow-xl max-h-60 overflow-auto">
                    {matchedAttorneys.map((attorney) => (
                      <button
                        key={attorney.id}
                        type="button"
                        onMouseDown={() => handleSelectAttorney(attorney)}
                        className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0"
                      >
                        <p className="text-white font-medium">
                          {attorney.first_name} {attorney.last_name}
                        </p>
                        {attorney.firm_name && (
                          <p className="text-white/50 text-sm">{attorney.firm_name}</p>
                        )}
                        {(attorney.certificate_email || attorney.email) && (
                          <p className="text-[#7EC8E3] text-xs mt-1">
                            {attorney.certificate_email || attorney.email}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Attorney Email Field */}
              <div className="relative">
                <label htmlFor="attorneyEmail" className="block text-sm font-medium text-white mb-2">
                  Correo del Abogado
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="attorneyEmail"
                    value={attorneyEmail}
                    onChange={(e) => handleAttorneyEmailChange(e.target.value)}
                    onFocus={() => matchedAttorneys.length > 0 && activeSearchField === 'email' && setShowEmailDropdown(true)}
                    onBlur={() => setTimeout(() => setShowEmailDropdown(false), 200)}
                    placeholder="abogado@ejemplo.com"
                    className="w-full bg-[#1C1C1C] border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:border-[#7EC8E3] focus:outline-none focus:ring-1 focus:ring-[#7EC8E3] transition-colors"
                    autoComplete="off"
                  />
                  {isSearching && activeSearchField === 'email' && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <svg className="w-5 h-5 text-white/40 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Email Search Dropdown */}
                {showEmailDropdown && matchedAttorneys.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-[#2A2A2A] border border-white/20 rounded-lg shadow-xl max-h-60 overflow-auto">
                    {matchedAttorneys.map((attorney) => (
                      <button
                        key={attorney.id}
                        type="button"
                        onMouseDown={() => handleSelectAttorney(attorney)}
                        className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0"
                      >
                        <p className="text-[#7EC8E3] font-medium">
                          {attorney.certificate_email || attorney.email}
                        </p>
                        <p className="text-white text-sm">
                          {attorney.first_name} {attorney.last_name}
                        </p>
                        {attorney.firm_name && (
                          <p className="text-white/50 text-xs">{attorney.firm_name}</p>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                
                {selectedAttorney && attorneyEmail && (
                  <p className="text-[#77DD77] text-xs mt-2 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Abogado encontrado en nuestra base de datos
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={saving || !isFormValid()}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold text-lg transition-all ${
                saving || !isFormValid()
                  ? 'bg-white/20 text-white/40 cursor-not-allowed'
                  : 'bg-[#77DD77] text-[#1C1C1C] hover:bg-[#88EE88] hover:shadow-lg hover:shadow-[#77DD77]/25 active:scale-[0.98]'
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
              ) : mode === 'post-exam' ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Generar Mi Certificado
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Guardar Perfil
                </>
              )}
            </button>
            
            {mode === 'pre-exam' && (
              <Link
                href="/panel"
                className="flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
              >
                Saltar por Ahora
              </Link>
            )}
          </div>

          {/* Required fields note */}
          <p className="text-white/40 text-sm text-center">
            <span className="text-[#FF9999]">*</span> Campos obligatorios
          </p>
        </form>
      </div>
    </main>
  );
}
