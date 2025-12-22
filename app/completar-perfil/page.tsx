'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

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
  
  // Exact match
  if (inputLower === targetLower) return { match: true, score: 100 };
  
  // Starts with
  if (targetLower.startsWith(inputLower)) return { match: true, score: 80 };
  
  // Contains
  if (targetLower.includes(inputLower)) return { match: true, score: 50 };
  
  // Fuzzy match - allow 1 error for short strings, 2 for longer
  const maxDistance = inputLower.length <= 4 ? 1 : 2;
  const distance = levenshtein(inputLower, targetLower.substring(0, inputLower.length + maxDistance));
  
  if (distance <= maxDistance) {
    return { match: true, score: 60 - (distance * 15) };
  }
  
  // Check if input is close to the start of target
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
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    legal_name: '',
    case_number: '',
    court_state: '',
    court_county: '',
    attorney_name: '',
    attorney_email: '',
  });
  
  // Attorney matching state
  const [matchedAttorneys, setMatchedAttorneys] = useState<MatchedAttorney[]>([]); // Multiple matches
  const [selectedAttorney, setSelectedAttorney] = useState<MatchedAttorney | null>(null); // User's selection
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [searchingAttorney, setSearchingAttorney] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/iniciar-sesion';
      }
    };
    checkAuth();
  }, []);

  // Search for attorney when name or email changes
  useEffect(() => {
    const searchAttorney = async () => {
      const name = formData.attorney_name.trim();
      const email = formData.attorney_email.trim().toLowerCase();
      
      // Need at least a name or email to search
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
            // Find exact matches first
            const exactMatches = emailMatches.filter(a => a.email?.toLowerCase() === email);
            
            if (exactMatches.length > 1) {
              // Multiple attorneys share this email - show selection
              setMatchedAttorneys(exactMatches);
              setSelectedAttorney(null);
              setVerifiedEmail(email);
              setSearchingAttorney(false);
              return;
            } else if (exactMatches.length === 1) {
              // Single exact match
              setMatchedAttorneys([exactMatches[0]]);
              setSelectedAttorney(exactMatches[0]);
              setVerifiedEmail(exactMatches[0].email);
              setSearchingAttorney(false);
              return;
            }
            
            // If only one partial match and email is substantial, show it
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
          
          // Need at least one substantial part
          if (nameParts.length === 0) {
            setMatchedAttorneys([]);
            setSelectedAttorney(null);
            setVerifiedEmail(null);
            setSearchingAttorney(false);
            return;
          }

          const lastPart = nameParts[nameParts.length - 1];
          const firstPart = nameParts[0];
          
          // Search by the last word (likely last name) - get more results for fuzzy matching
          const searchPattern = lastPart.substring(0, Math.max(2, lastPart.length - 2));
          const { data: nameMatches } = await supabase
            .from('attorneys')
            .select('id, first_name, last_name, firm_name, email')
            .ilike('last_name', `%${searchPattern}%`)
            .limit(50);

          if (nameMatches && nameMatches.length > 0) {
            // Score each match using fuzzy matching
            const scored = nameMatches.map(att => {
              let score = 0;
              const firstName = (att.first_name || '').toLowerCase();
              const lastName = (att.last_name || '').toLowerCase();
              
              // Check last name match (required)
              const lastNameMatch = isSimilar(lastPart, lastName);
              if (!lastNameMatch.match) {
                return { ...att, score: 0 };
              }
              score += lastNameMatch.score;
              
              // Check first name match (if provided)
              if (nameParts.length > 1) {
                const firstNameMatch = isSimilar(firstPart, firstName);
                if (firstNameMatch.match) {
                  score += firstNameMatch.score;
                } else {
                  // First name provided but doesn't match - heavy penalty
                  score -= 40;
                }
              }
              
              return { ...att, score };
            }).filter(a => a.score > 30).sort((a, b) => b.score - a.score);

            // Show best match if score is good enough
            if (scored.length > 0 && scored[0].score >= 50) {
              setMatchedAttorneys([scored[0]]);
              setSelectedAttorney(scored[0]);
              setVerifiedEmail(scored[0].email);
              setSearchingAttorney(false);
              return;
            }
          }
          
          // If no last name match, try first name only (single word input)
          if (nameParts.length === 1 && firstPart.length >= 4) {
            const { data: firstNameMatches } = await supabase
              .from('attorneys')
              .select('id, first_name, last_name, firm_name, email')
              .ilike('first_name', `${firstPart}%`)
              .limit(5);
            
            // Only show if there's exactly ONE match (unambiguous)
            if (firstNameMatches && firstNameMatches.length === 1) {
              setMatchedAttorneys([firstNameMatches[0]]);
              setSelectedAttorney(firstNameMatches[0]);
              setVerifiedEmail(firstNameMatches[0].email);
              setSearchingAttorney(false);
              return;
            }
          }
        }

        // No match found
        setMatchedAttorneys([]);
        setSelectedAttorney(null);
        setVerifiedEmail(null);
      } catch (error) {
        console.error('Attorney search error:', error);
      }

      setSearchingAttorney(false);
    };

    // Debounce the search
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
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = '/iniciar-sesion';
      return;
    }

    // Use verified email from database if available, otherwise use what they typed
    const finalAttorneyEmail = verifiedEmail || formData.attorney_email;
    
    // Include the selected attorney's ID if they selected one
    const profileUpdate: Record<string, unknown> = {
      ...formData,
      attorney_email: finalAttorneyEmail,
      profile_completed: true,
    };
    
    // If user selected a specific attorney, store their ID for proper referral tracking
    if (selectedAttorney) {
      profileUpdate.attorney_id = selectedAttorney.id;
      // Also update attorney name to match the selected attorney
      profileUpdate.attorney_name = getAttorneyDisplayName(selectedAttorney);
    }

    const { error } = await supabase
      .from('profiles')
      .update(profileUpdate)
      .eq('id', user.id);

    if (error) {
      alert('Error al guardar. Por favor, intente de nuevo.');
      setLoading(false);
      return;
    }

    // Check if user has a certificate and redirect there
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

  return (
    <main className="min-h-screen bg-background py-12 px-4 md:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Información del Certificado
          </h1>
          <p className="text-white/70">
            Ingrese su nombre exactamente como aparece en sus documentos legales. Esta información aparecerá en su certificado oficial.
          </p>
          <p className="text-sm text-[#FFFFFF] bg-[#7EC8E3]/10 rounded-lg px-4 py-3 mt-4 inline-block">
            Todos los certificados se emiten en inglés para su aceptación por los tribunales de Estados Unidos.
          </p>
        </div>

        <div className="bg-background rounded-2xl shadow-xl shadow-black/40 p-3 md:p-8 border border-[#FFFFFF]/15">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-white mb-2" style={{ fontSize: '22px' }}>
                Nombre Legal Completo *
              </label>
              <input
                type="text"
                value={formData.legal_name}
                onChange={(e) => setFormData({...formData, legal_name: e.target.value})}
                className="w-full px-4 py-3 border border-[#FFFFFF]/20 rounded-lg focus:ring-2 focus:ring-[#FFFFFF] focus:border-[#FFFFFF] text-white"
                placeholder="Este nombre aparecerá en su certificado"
                style={{ fontSize: '14px' }}
                required
              />
              <p style={{ fontSize: '7px' }} className="text-white/60 mt-1">Este nombre debe coincidir con sus documentos legales y expedientes judiciales</p>
            </div>

            <div>
              <label className="block font-semibold text-white mb-2" style={{ fontSize: '14px' }}>
                Estado Donde se Presentó el Caso
              </label>
              <select
                value={formData.court_state}
                onChange={(e) => setFormData({...formData, court_state: e.target.value})}
                className="w-full px-4 py-3 border border-[#FFFFFF]/20 rounded-lg focus:ring-2 focus:ring-[#FFFFFF] focus:border-[#FFFFFF] text-white bg-background"
                style={{ fontSize: '16px' }}
              >
                <option value="">Seleccionar Estado (Opcional)</option>
                {US_STATES.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-white mb-2" style={{ fontSize: '14px' }}>
                Condado / Parroquia / Distrito / Ciudad
              </label>
              <input
                type="text"
                value={formData.court_county}
                onChange={(e) => setFormData({...formData, court_county: e.target.value})}
                className="w-full px-4 py-3 border border-[#FFFFFF]/20 rounded-lg focus:ring-2 focus:ring-[#FFFFFF] focus:border-[#FFFFFF] text-white"
                placeholder="Opcional"
                style={{ fontSize: '16px' }}
              />
            </div>

            <div>
              <label className="block font-semibold text-white mb-2" style={{ fontSize: '14px' }}>
                Número de Caso / Expediente / Causa
              </label>
              <input
                type="text"
                value={formData.case_number}
                onChange={(e) => setFormData({...formData, case_number: e.target.value})}
                className="w-full px-4 py-3 border border-[#FFFFFF]/20 rounded-lg focus:ring-2 focus:ring-[#FFFFFF] focus:border-[#FFFFFF] text-white"
                placeholder="Opcional"
                style={{ fontSize: '16px' }}
              />
            </div>

            <div className="border-t border-[#FFFFFF]/15 pt-6">
              <h3 className="font-semibold text-white mb-4" style={{ fontSize: '14px' }}>
                Información del Abogado (Opcional)
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1" style={{ fontSize: '11px' }}>
                    Nombre del Abogado
                  </label>
                  <input
                    type="text"
                    value={formData.attorney_name}
                    onChange={(e) => setFormData({...formData, attorney_name: e.target.value})}
                    className="w-full px-4 py-3 border border-[#FFFFFF]/20 rounded-lg focus:ring-2 focus:ring-[#FFFFFF] focus:border-[#FFFFFF] text-white"
                    placeholder="Nombre completo del abogado"
                    style={{ fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1" style={{ fontSize: '11px' }}>
                    Correo Electrónico del Abogado
                  </label>
                  <input
                    type="email"
                    value={formData.attorney_email}
                    onChange={(e) => setFormData({...formData, attorney_email: e.target.value})}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#FFFFFF] focus:border-[#FFFFFF] text-white ${
                      isEmailVerified 
                        ? 'border-[#77DD77] bg-[#77DD77]/10' 
                        : hasMultipleMatches
                          ? 'border-[#FFFFFF]/50 bg-[#7EC8E3]/10'
                          : verifiedEmail && verifiedEmail !== formData.attorney_email 
                            ? 'border-[#FFB347] bg-[#FFB347]/10' 
                            : 'border-[#FFFFFF]/20'
                    }`}
                    placeholder="abogado@ejemplo.com"
                    style={{ fontSize: '14px' }}
                  />
                  <p className="text-white/60 mt-1" style={{ fontSize: '11px' }}>Le enviaremos una copia de su certificado</p>
                </div>

                {/* Attorney Match Notification */}
                {searchingAttorney && (
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <div className="w-4 h-4 border-2 border-[#FFFFFF]/20 border-t-[#7EC8E3] rounded-full animate-spin"></div>
                    Buscando abogado...
                  </div>
                )}

                {/* Multiple attorneys found - show selection */}
                {hasMultipleMatches && !searchingAttorney && (
                  <div className="rounded-lg p-4 bg-[#7EC8E3]/10 border border-[#7EC8E3]/30">
                    <p className="font-semibold text-[#FFFFFF] mb-3">
                      Se encontraron varios abogados con este correo electrónico:
                    </p>
                    <div className="space-y-2">
                      {matchedAttorneys.map((attorney) => (
                        <button
                          key={attorney.id}
                          type="button"
                          onClick={() => handleSelectAttorney(attorney)}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                            selectedAttorney?.id === attorney.id
                              ? 'border-[#77DD77]/100 bg-[#77DD77]/10'
                              : 'border-[#FFFFFF]/15 bg-background hover:border-[#FFFFFF]/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedAttorney?.id === attorney.id
                                ? 'border-[#77DD77]/100 bg-[#77DD77]'
                                : 'border-[#FFFFFF]/20'
                            }`}>
                              {selectedAttorney?.id === attorney.id && (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-white">{getAttorneyDisplayName(attorney)}</p>
                              {attorney.firm_name && (
                                <p className="text-sm text-white/70">{attorney.firm_name}</p>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    {selectedAttorney && (
                      <p className="mt-3 text-sm text-[#77DD77] flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Seleccionado: {getAttorneyDisplayName(selectedAttorney)}
                      </p>
                    )}
                  </div>
                )}

                {/* Single match found */}
                {hasSingleMatch && !searchingAttorney && (
                  <div className={`rounded-lg p-4 ${
                    isEmailVerified 
                      ? 'bg-[#77DD77]/10 border border-[#77DD77]/30' 
                      : 'bg-[#FFB347]/10 border border-[#FFB347]/30'
                  }`}>
                    {isEmailVerified ? (
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-[#77DD77] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-[#77DD77]">✓ Abogado Verificado</p>
                          <p className="text-sm text-[#77DD77]">
                            {getAttorneyDisplayName(selectedAttorney!)}
                            {selectedAttorney!.firm_name && selectedAttorney!.first_name && (
                              <span className="text-[#77DD77]"> - {selectedAttorney!.firm_name}</span>
                            )}
                          </p>
                          <p className="text-sm text-[#77DD77] mt-1">
                            {verifiedEmail}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="font-semibold text-[#FFB347] mb-2">¿Es este su abogado?</p>
                        <p className="text-sm text-[#FFA337] mb-3">
                          Encontramos a <strong>{getAttorneyDisplayName(matchedAttorneys[0])}</strong>
                          {matchedAttorneys[0].firm_name && matchedAttorneys[0].first_name && (
                            <span> de {matchedAttorneys[0].firm_name}</span>
                          )}
                          {verifiedEmail && (
                            <span> con el correo <strong>{verifiedEmail}</strong></span>
                          )}
                        </p>
                        {verifiedEmail && verifiedEmail !== formData.attorney_email && (
                          <button
                            type="button"
                            onClick={handleUseVerifiedEmail}
                            className="bg-[#FFB347] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#FFA337] transition-colors"
                          >
                            Usar este correo verificado
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !formData.legal_name || (hasMultipleMatches && !selectedAttorney)}
              className="w-full bg-[#7EC8E3] text-white py-4 rounded-lg font-bold hover:bg-[#6BB8D3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {loading ? 'Guardando...' : hasMultipleMatches && !selectedAttorney ? 'Seleccione su abogado' : 'Guardar y Continuar'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}