'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface CertificateData {
  certificate_number: string;
  participant_name: string;
  legal_name: string;
  course_type: string;
  court_state: string;
  court_county: string;
  case_number: string;
  issued_at: string;
  purchased_at: string;
  completed_at: string;
}

export default function VerifyPage() {
  const params = useParams();
  const code = params.code as string;
  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await fetch(`/api/verify/${code}`);
        const data = await response.json();

        if (!data.found) {
          setError(true);
        } else {
          setCertificate(data.certificate);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [code]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const getCourseNameEn = (type: string, state: string) => {
    if (state === 'Florida') return 'Parent Education and Family Stabilization Course';
    const names: Record<string, string> = { coparenting: 'Co-Parenting Class', parenting: 'Parenting Class', bundle: 'Complete Parenting Program' };
    return names[type] || type;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7EC8E3] mx-auto mb-4"></div>
          <p className="text-white/70">Verifying certificate...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <img src="/logo.svg" alt="Putting Kids First" className="h-16 mx-auto" onError={(e) => { e.currentTarget.style.display = 'none' }} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Certificate Verification</h1>
          <p className="text-white/70 font-brand">Putting Kids First®</p>
        </div>

        {error ? (
          <div className="bg-background rounded-2xl border border-[#FFFFFF]/15 shadow-xl shadow-black/40 overflow-hidden">
            <div className="bg-[#FF9999]/100 px-6 py-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-background/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Certificate Not Found</h2>
                <p className="text-white/80 text-sm">This certificate could not be verified</p>
              </div>
            </div>
            <div className="p-6">
              <p className="text-white/70 mb-4">The verification code entered does not match any certificate in our system. This could mean:</p>
              <ul className="text-sm text-white/70 space-y-2 mb-6">
                <li className="flex items-start gap-2"><span className="text-[#FF9999]/100">•</span>The code was entered incorrectly</li>
                <li className="flex items-start gap-2"><span className="text-[#FF9999]/100">•</span>The certificate does not exist</li>
                <li className="flex items-start gap-2"><span className="text-[#FF9999]/100">•</span>The document may be fraudulent</li>
              </ul>
              <p className="text-sm text-white/60">Verification code attempted: <span className="font-mono bg-[#2A2A2A] px-2 py-1 rounded">{code}</span></p>
            </div>
          </div>
        ) : (
          <div className="bg-background rounded-2xl border border-[#FFFFFF]/15 shadow-xl shadow-black/40 overflow-hidden">
            <div className="bg-[#77DD77] px-6 py-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-background/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Certificate Verified</h2>
                <p className="text-white/80 text-sm">This certificate is authentic and valid</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wide">Course Completed</label>
                <p className="text-lg font-semibold text-white">{getCourseNameEn(certificate?.course_type || '', certificate?.court_state || '')}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wide">Participant Name</label>
                <p className="text-lg font-semibold text-white">{certificate?.legal_name}</p>
              </div>

              {certificate?.court_state && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-white/60 uppercase tracking-wide">State</label>
                    <p className="text-white font-medium">{certificate.court_state}</p>
                  </div>
                  {certificate?.court_county && (
                    <div>
                      <label className="text-xs font-semibold text-white/60 uppercase tracking-wide">Filed</label>
                      <p className="text-white font-medium">{certificate.court_county}</p>
                    </div>
                  )}
                </div>
              )}

              {certificate?.case_number && (
                <div>
                  <label className="text-xs font-semibold text-white/60 uppercase tracking-wide">File Number</label>
                  <p className="text-white font-medium">{certificate.case_number}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-white/60 uppercase tracking-wide">Date Registered</label>
                  <p className="text-white font-medium">{formatDate(certificate?.purchased_at || '')}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/60 uppercase tracking-wide">Date Completed</label>
                  <p className="text-white font-medium">{formatDate(certificate?.completed_at || '')}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#FFFFFF]/15">
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wide">Certificate Number</label>
                <p className="font-mono text-white">{certificate?.certificate_number}</p>
              </div>

              <div className="pt-4 border-t border-[#FFFFFF]/15">
                <label className="text-xs font-semibold text-white/60 uppercase tracking-wide">Issuing Provider</label>
                <p className="text-white font-medium font-brand">Putting Kids First®</p>
                <p className="text-sm text-white/70">info@claseparapadres.com</p>
                <p className="text-sm text-white/70">888-777-2298</p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mt-8">
          <p className="text-xs text-white/60 font-brand">Putting Kids First® • Established 1993</p>
          <p className="text-xs text-white/70 mt-1">www.claseparapadres.com</p>
        </div>
      </div>

    </main>
  );
}
