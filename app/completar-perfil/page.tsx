'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming', 'District of Columbia', 'Puerto Rico', 'U.S. Virgin Islands', 'Guam'
];

// Levenshtein distance for fuzzy matching
function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] = b[i-1] === a[j-1] 
        ? matrix[i-1][j-1] 
        : Math.min(matrix[i-1][j-1] + 1, matrix[i][j-1] + 1, matrix[i-1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
}

// Check if two strings are similar (within edit distance based on length)
function isSimilar(input: string, target: string): { match: boolean; score: number } {
  const inputLower = input.toLowerCase();
  const targetLower = target.toLowerCase();
  
  if (inputLower === targetLower) return { match: true, score: 100 };
  if (targetLower.startsWith(inputLower)) return { match: true, score: 80 };
  if (targetLower.includes(inputLower)) return { match: true, score: 50 };
  
  const maxDistance = inputLower.length <= 4 ? 1 : 2;
  const distance = levenshtein(inputLower, targetLower.substring(0, inputLower.length + maxDistance));
  
  if (distance <= maxDistance) {
    return { match: true, score: 60 - (distance * 15) };
  }
  
  const targetStart = targetLower.substring(0, Math.min(inputLower.length + 2, targetLower.length));
  const startDistance = levenshtein(inputLower, targetStart);
  if (startDistance <= maxDistance) {
    return { match: true, score: 55 - (startDistance * 15) };
  }
  
  return { match: false, score: 0 };
}

interface MatchedAttorney {
  id: string;
  first_name: string | null;
  last_name: string | null;
  firm_name: string | null;
  email: string | null;
}

export default function CompleteProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingCourseType, setPendingCourseType] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    legal_name: '',
    case_number: '',
    court_state: '',
    court_county: '',
    attorney_name: '',
    attorney_email: '',
  });
  
  // Attorney matching state
  const [matchedAttorneys, setMatchedAttorneys] = useState<MatchedAttorney[]>([]);
  const [selectedAttorney, setSelectedAttorney] = useState<MatchedAttorney | null>(null);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [searchingAttorney, setSearchingAttorney] = useState(false);

  const supabase = createClient();

  // ============================================
  // ACCESS CONTROL: Only allow after passing exam
  // ============================================
  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        window.location.href = '/iniciar-sesion';
        return;
      }

      // Check if profile is already completed - redirect to panel
      const { data: profile } = await supabase
        .from('profiles')
        .select('profile_completed')
        .eq('id', user.id)
        .single();

      if (profile?.profile_completed) {
        // Profile already done, check for certificate and redirect
        const { data: certs } = await supabase
          .from('certificates')
          .select('id')
          .eq('user_id', user.id)
          .order('issued_at', { ascending: false })
          .limit(1);

        if (certs && certs.length > 0) {
          window.location.href = `/certificado/${certs[0].id}`;
        } else {
          window.location.href = '/panel';
        }
        return;
      }

      // Check if user has passed an exam (has a certificate pending profile completion)
      // A certificate is created when exam is passed, but we need profile to finalize it
      const { data: certificates } = await supabase
        .from('certificates')
        .select('id, course_type')
        .eq('user_id', user.id)
        .order('issued_at', { ascending: false })
        .limit(1);

      if (certificates && certificates.length > 0) {
        // User has passed exam, allow access
        setPendingCourseType(certificates[0].course_type);
        setLoading(false);
        return;
      }

      // Check if user has a completed exam attempt that passed
      const { data: passedExams } = await supabase
        .from('exam_attempts')
        .select('course_type')
        .eq('user_id', user.id)
        .eq('passed', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (passedExams && passedExams.length > 0) {
        // User passed exam, allow access
        setPendingCourseType(passedExams[0].course_type);
        setLoading(false);
        return;
      }

      // User hasn't passed an exam yet - redirect to panel
      window.location.href = '/panel';
    };

    checkAccess();
  }, []);

  // Search for attorney when name or email changes
  useEffect(() => {
    const searchAttorney = async () => {
      const name = formData.attorney_name.trim();
      const email = formData.attorney_email.trim().toLowerCase();
      
      if (!name && !email) {
        setMatchedAttorneys([]);
        setSelectedAttorney(null);
        setVerifiedEmail(null);
        return;
      }

      setSearchingAttorney(true);

      try {
        // If email provided (at least 5 chars), search by email
        if (email && email.length >= 5) {
          const { data: emailMatches } = await supabase
            .from('attorneys')
            .select('id, first_name, last_name, firm_name, email')
            .ilike('email', `${email}%`)
            .limit(20);
          
          if (emailMatches && emailMatches.length > 0) {
            const exactMatches = emailMatches.filter(a => a.email?.toLowerCase() === email);
            
            if (exactMatches.length > 1) {
              setMatchedAttorneys(exactMatches);
              setSelectedAttorney(null);
              setVerifiedEmail(email);
              setSearchingAttorney(false);
              return;
            } else if (exactMatches.length === 1) {
              setMatchedAttorneys([exactMatches[0]]);
              setSelectedAttorney(exactMatches[0]);
              setVerifiedEmail(exactMatches[0].email);
              setSearchingAttorney(false);
              return;
            }
            
            if (emailMatches.length === 1 && email.length >= 8) {
              setMatchedAttorneys([emailMatches[0]]);
              setSelectedAttorney(emailMatches[0]);
              setVerifiedEmail(emailMatches[0].email);
              setSearchingAttorney(false);
              return;
            }
          }
        }

        // If name provided (at least 3 chars), search by name
        if (name && name.length >= 3) {
          const nameLower = name.toLowerCase();
          const nameParts = nameLower.split(' ').filter(p => p.length > 1);
          
          if (nameParts.length === 0) {
            setMatchedAttorneys([]);
            setSelectedAttorney(null);
            setVerifiedEmail(null);
            setSearchingAttorney(false);
            return;
          }

          const lastPart = nameParts[nameParts.length - 1];
          const firstPart = nameParts[0];
          
          const searchPattern = lastPart.substring(0, Math.max(2, lastPart.length - 2));
          const { data: nameMatches } = await supabase
            .from('attorneys')
            .select('id, first_name, last_name, firm_name, email')
            .ilike('last_name', `%${searchPattern}%`)
            .limit(50);

          if (nameMatches && nameMatches.length > 0) {
            const scored = nameMatches.map(att => {
              let score = 0;
              const firstName = (att.first_name || '').toLowerCase();
              const lastName = (att.last_name || '').toLowerCase();
              
              const lastNameMatch = isSimilar(lastPart, lastName);
              if (!lastNameMatch.match) {
                return { ...att, score: 0 };
              }
              score += lastNameMatch.score;
              
              if (nameParts.length > 1) {
                const firstNameMatch = isSimilar(firstPart, firstName);
                if (firstNameMatch.match) {
                  score += firstNameMatch.score;
                } else {
                  score -= 40;
                }
              }
              
              return { ...att, score };
            }).filter(a => a.score > 30).sort((a, b) => b.score - a.score);

            if (scored.length > 0 && scored[0].score >= 50) {
              setMatchedAttorneys([scored[0]]);
              setSelectedAttorney(scored[0]);
              setVerifiedEmail(scored[0].email);
              setSearchingAttorney(false);
              return;
            }
          }
          
          if (nameParts.length === 1 && firstPart.length >= 4) {
            const { data: firstNameMatches } = await supabase
              .from('attorneys')
              .select('id, first_name, last_name, firm_name, email')
              .ilike('first_name', `${firstPart}%`)
              .limit(5);
            
            if (firstNameMatches && firstNameMatches.length === 1) {
              setMatchedAttorneys([firstNameMatches[0]]);
              setSelectedAttorney(firstNameMatches[0]);
              setVerifiedEmail(firstNameMatches[0].email);
              setSearchingAttorney(false);
              return;
            }
          }
        }

        setMatchedAttorneys([]);
        setSelectedAttorney(null);
        setVerifiedEmail(null);
      } catch (error) {
        console.error('Attorney search error:', error);
      }

      setSearchingAttorney(false);
    };

    const timer = setTimeout(searchAttorney, 400);
    return () => clearTimeout(timer);
  }, [formData.attorney_name, formData.attorney_email]);

  const getAttorneyDisplayName = (att: MatchedAttorney) => {
    if (att.first_name || att.last_name) {
      return [att.first_name, att.last_name].filter(Boolean).join(' ');
    }
    return att.firm_name || 'Unknown';
  };

  const handleSelectAttorney = (attorney: MatchedAttorney) => {
    setSelectedAttorney(attorney);
  };

  const handleUseVerifiedEmail = () => {
    if (verifiedEmail) {
      setFormData({ ...formData, attorney_email: verifiedEmail });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = '/iniciar-sesion';
      return;
    }

    const finalAttorneyEmail = verifiedEmail || formData.attorney_email;
    
    const profileUpdate: Record<string, unknown> = {
      ...formData,
      attorney_email: finalAttorneyEmail,
      profile_completed: true,
    };
    
    if (selectedAttorney) {
      profileUpdate.attorney_id = selectedAttorney.id;
      profileUpdate.attorney_name = getAttorneyDisplayName(selectedAttorney);
    }

    const { error } = await supabase
      .from('profiles')
      .update(profileUpdate)
      .eq('id', user.id);

    if (error) {
      alert('Error al guardar. Por favor, intente de nuevo.');
      setSaving(false);
      return;
    }

    // Redirect to certificate
    const { data: certs } = await supabase
      .from('certificates')
      .select('id')
      .eq('user_id', user.id)
      .order('issued_at', { ascending: false })
      .limit(1);

    if (certs && certs.length > 0) {
      window.location.href = `/certificado/${certs[0].id}`;
    } else {
      window.location.href = '/panel';
    }
  };

  const hasMultipleMatches = matchedAttorneys.length > 1;
  const hasSingleMatch = matchedAttorneys.length === 1;
  const isEmailVerified = selectedAttorney && verifiedEmail === formData.attorney_email;

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <svg className="w-full h-full animate-spin" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r="40"
                fill="none" stroke="#77DD77" strokeWidth="4"
                strokeLinecap="round" strokeDasharray="60 140"
              />
            </svg>
          </div>
          <p className="text-white/70">Preparando su certificado...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4">
          <Link href="/" className="text-white font-semibold font-brand">
            Putting Kids First<sup className="text-[8px] relative -top-2">®</sup>
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Success Banner */}
        <div className="bg-[#77DD77]/10 border border-[#77DD77]/30 rounded-2xl p-6 mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-[#77DD77]/20 border-2 border-[#77DD77]/40">
            <svg className="w-8 h-8 text-[#77DD77]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            ¡Felicidades! Ha Aprobado el Examen
          </h1>
          <p className="text-white/70">
            Complete la información a continuación para generar su certificado oficial.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#2A2A2A] rounded-2xl p-6 md:p-8 border border-white/10">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-2">Información del Certificado</h2>
            <p className="text-white/60 text-sm">
              Esta información aparecerá en su certificado oficial aceptado por la corte.
            </p>
          </div>

          {/* English Notice */}
          <div className="bg-[#7EC8E3]/10 border border-[#7EC8E3]/30 rounded-xl px-4 py-3 mb-6">
            <p className="text-sm text-[#7EC8E3]">
              <strong>Nota:</strong> Todos los certificados se emiten en inglés para su aceptación por los tribunales de Estados Unidos.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Legal Name - Required */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Nombre Legal Completo <span className="text-[#FF9999]">*</span>
              </label>
              <input
                type="text"
                value={formData.legal_name}
                onChange={(e) => setFormData({...formData, legal_name: e.target.value})}
                className="w-full px-4 py-3 bg-[#1C1C1C] border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-[#7EC8E3] focus:ring-1 focus:ring-[#7EC8E3] transition-colors"
                placeholder="Nombre exacto como aparece en documentos legales"
                required
              />
              <p className="text-white/50 text-xs mt-1.5">
                Este nombre debe coincidir con sus documentos legales y expedientes judiciales.
              </p>
            </div>

            {/* Court State */}
            <div>
              <label className="block text-white font-medium mb-2">
                Estado Donde se Presentó el Caso
              </label>
              <select
                value={formData.court_state}
                onChange={(e) => setFormData({...formData, court_state: e.target.value})}
                className="w-full px-4 py-3 bg-[#1C1C1C] border border-white/20 rounded-xl text-white focus:border-[#7EC8E3] focus:ring-1 focus:ring-[#7EC8E3] transition-colors"
              >
                <option value="">Seleccionar Estado (Opcional)</option>
                {US_STATES.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            {/* Court County */}
            <div>
              <label className="block text-white font-medium mb-2">
                Condado / Parroquia / Distrito
              </label>
              <input
                type="text"
                value={formData.court_county}
                onChange={(e) => setFormData({...formData, court_county: e.target.value})}
                className="w-full px-4 py-3 bg-[#1C1C1C] border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-[#7EC8E3] focus:ring-1 focus:ring-[#7EC8E3] transition-colors"
                placeholder="Opcional"
              />
            </div>

            {/* Case Number */}
            <div>
              <label className="block text-white font-medium mb-2">
                Número de Caso / Expediente
              </label>
              <input
                type="text"
                value={formData.case_number}
                onChange={(e) => setFormData({...formData, case_number: e.target.value})}
                className="w-full px-4 py-3 bg-[#1C1C1C] border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-[#7EC8E3] focus:ring-1 focus:ring-[#7EC8E3] transition-colors"
                placeholder="Opcional"
              />
            </div>

            {/* Attorney Section */}
            <div className="border-t border-white/10 pt-6">
              <h3 className="text-white font-semibold mb-4">
                Información del Abogado <span className="text-white/50 font-normal">(Opcional)</span>
              </h3>

              <div className="space-y-4">
                {/* Attorney Name */}
                <div>
                  <label className="block text-white/80 text-sm mb-1.5">
                    Nombre del Abogado
                  </label>
                  <input
                    type="text"
                    value={formData.attorney_name}
                    onChange={(e) => setFormData({...formData, attorney_name: e.target.value})}
                    className="w-full px-4 py-3 bg-[#1C1C1C] border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-[#7EC8E3] focus:ring-1 focus:ring-[#7EC8E3] transition-colors"
                    placeholder="Nombre completo del abogado"
                  />
                </div>

                {/* Attorney Email */}
                <div>
                  <label className="block text-white/80 text-sm mb-1.5">
                    Correo Electrónico del Abogado
                  </label>
                  <input
                    type="email"
                    value={formData.attorney_email}
                    onChange={(e) => setFormData({...formData, attorney_email: e.target.value})}
                    className={`w-full px-4 py-3 bg-[#1C1C1C] border rounded-xl text-white placeholder-white/40 focus:ring-1 transition-colors ${
                      isEmailVerified 
                        ? 'border-[#77DD77] focus:border-[#77DD77] focus:ring-[#77DD77]' 
                        : hasMultipleMatches
                          ? 'border-[#7EC8E3] focus:border-[#7EC8E3] focus:ring-[#7EC8E3]'
                          : verifiedEmail && verifiedEmail !== formData.attorney_email 
                            ? 'border-[#FFB347] focus:border-[#FFB347] focus:ring-[#FFB347]' 
                            : 'border-white/20 focus:border-[#7EC8E3] focus:ring-[#7EC8E3]'
                    }`}
                    placeholder="abogado@ejemplo.com"
                  />
                  <p className="text-white/50 text-xs mt-1.5">
                    Le enviaremos una copia de su certificado automáticamente.
                  </p>
                </div>

                {/* Attorney Search Status */}
                {searchingAttorney && (
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-[#7EC8E3] rounded-full animate-spin"></div>
                    Buscando abogado...
                  </div>
                )}

                {/* Multiple attorneys found */}
                {hasMultipleMatches && !searchingAttorney && (
                  <div className="rounded-xl p-4 bg-[#7EC8E3]/10 border border-[#7EC8E3]/30">
                    <p className="font-semibold text-white mb-3">
                      Se encontraron varios abogados con este correo:
                    </p>
                    <div className="space-y-2">
                      {matchedAttorneys.map((attorney) => (
                        <button
                          key={attorney.id}
                          type="button"
                          onClick={() => handleSelectAttorney(attorney)}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                            selectedAttorney?.id === attorney.id
                              ? 'border-[#77DD77] bg-[#77DD77]/10'
                              : 'border-white/10 bg-[#1C1C1C] hover:border-white/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedAttorney?.id === attorney.id
                                ? 'border-[#77DD77] bg-[#77DD77]'
                                : 'border-white/30'
                            }`}>
                              {selectedAttorney?.id === attorney.id && (
                                <svg className="w-3 h-3 text-[#1C1C1C]" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-white">{getAttorneyDisplayName(attorney)}</p>
                              {attorney.firm_name && (
                                <p className="text-sm text-white/60">{attorney.firm_name}</p>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Single match found */}
                {hasSingleMatch && !searchingAttorney && (
                  <div className={`rounded-xl p-4 ${
                    isEmailVerified 
                      ? 'bg-[#77DD77]/10 border border-[#77DD77]/30' 
                      : 'bg-[#FFB347]/10 border border-[#FFB347]/30'
                  }`}>
                    {isEmailVerified ? (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-[#77DD77] rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-[#1C1C1C]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-[#77DD77]">✓ Abogado Verificado</p>
                          <p className="text-sm text-[#77DD77]/80">
                            {getAttorneyDisplayName(selectedAttorney!)}
                            {selectedAttorney!.firm_name && selectedAttorney!.first_name && (
                              <span> — {selectedAttorney!.firm_name}</span>
                            )}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="font-semibold text-[#FFB347] mb-2">¿Es este su abogado?</p>
                        <p className="text-sm text-[#FFB347]/80 mb-3">
                          Encontramos a <strong>{getAttorneyDisplayName(matchedAttorneys[0])}</strong>
                          {matchedAttorneys[0].firm_name && matchedAttorneys[0].first_name && (
                            <span> de {matchedAttorneys[0].firm_name}</span>
                          )}
                        </p>
                        {verifiedEmail && verifiedEmail !== formData.attorney_email && (
                          <button
                            type="button"
                            onClick={handleUseVerifiedEmail}
                            className="bg-[#FFB347] text-[#1C1C1C] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#FFC05C] transition-colors"
                          >
                            Usar correo verificado
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving || !formData.legal_name || (hasMultipleMatches && !selectedAttorney)}
              className="w-full bg-[#77DD77] text-[#1C1C1C] py-4 rounded-xl font-bold text-lg hover:bg-[#88EE88] transition-all hover:shadow-lg hover:shadow-[#77DD77]/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-3"
            >
              {saving ? (
                <>
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Generando Certificado...</span>
                </>
              ) : hasMultipleMatches && !selectedAttorney ? (
                'Seleccione su abogado para continuar'
              ) : (
                <>
                  <span>Obtener Mi Certificado</span>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}