'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface CertificateData {
  id: string;
  certificate_number: string;
  verification_code: string;
  participant_name: string;
  course_type: string;
  issued_at: string;
  legal_name: string;
  court_state: string;
  court_county: string;
  case_number: string;
  completed_at: string;
  purchased_at: string;
}

export default function CertificatePage() {
  const params = useParams();
  const certId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState<CertificateData | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/iniciar-sesion'; return; }

      const { data: cert } = await supabase
        .from('certificates')
        .select('*')
        .eq('id', certId)
        .eq('user_id', user.id)
        .single();

      if (!cert) { window.location.href = '/panel'; return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('legal_name, court_state, court_county, case_number')
        .eq('id', user.id)
        .single();

      const { data: progress } = await supabase
        .from('course_progress')
        .select('started_at, completed_at')
        .eq('user_id', user.id)
        .eq('course_type', cert.course_type)
        .single();

      const { data: purchases } = await supabase
        .from('purchases')
        .select('purchased_at')
        .eq('user_id', user.id)
        .or(`course_type.eq.${cert.course_type},course_type.eq.bundle`)
        .limit(1);

      setCertificate({
        id: cert.id,
        certificate_number: cert.certificate_number,
        verification_code: cert.verification_code,
        participant_name: cert.participant_name || profile?.legal_name || '',
        course_type: cert.course_type,
        issued_at: cert.issued_at,
        legal_name: profile?.legal_name || '',
        court_state: profile?.court_state || '',
        court_county: profile?.court_county || '',
        case_number: profile?.case_number || '',
        completed_at: progress?.completed_at || cert.issued_at,
        purchased_at: purchases?.[0]?.purchased_at || cert.issued_at
      });
      setLoading(false);
    };
    load();
  }, [certId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const getCourseNameEn = (type: string) => {
    const names: Record<string, string> = { coparenting: 'Co-Parenting Class', parenting: 'Parenting Class', bundle: 'Complete Parenting Program' };
    return names[type] || type;
  };

  const handleDownload = () => {
    window.location.href = `/api/certificate/${certId}`;
  };

  if (loading) {
    return <main className="min-h-screen bg-[#1a2421] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div></main>;
  }

  const verifyUrl = `https://www.cursoparapadres.org/verificar/${certificate?.verification_code}`;

  return (
    <main className="min-h-screen bg-[#1a2421]">
      <header className="bg-[#1a2421] border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/panel" className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Volver al Panel de Control
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-green-900/20 border border-green-700/50 rounded-xl p-6 mb-8 flex items-start gap-4">
          <div className="w-12 h-12 bg-green-900/50 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-green-300">¡Felicitaciones! Su certificado está listo.</h2>
            <p className="text-green-400/80 text-sm mt-1">Puede descargar su certificado oficial en formato PDF.</p>
          </div>
        </div>

        <div className="bg-[#1a2421] rounded-2xl shadow-lg shadow-black/30 overflow-hidden mb-8 border border-gray-700">
          <div className="bg-gray-900 px-8 py-6 text-center border-b border-gray-700">
            <h1 className="text-2xl font-bold text-white mb-1">Certificate of Completion</h1>
            <p className="text-gray-400">{getCourseNameEn(certificate?.course_type || '')}</p>
            <p className="text-gray-500 text-sm">Parent Education and Family Stabilization Course</p>
          </div>

          <div className="p-8">
            <div className="text-center mb-8">
              <p className="text-gray-500 text-sm mb-1">This certifies that</p>
              <h2 className="text-3xl font-bold text-white">{certificate?.legal_name || certificate?.participant_name}</h2>
              <p className="text-gray-500 text-sm mt-1">has successfully completed the course requirements</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {certificate?.court_state && <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">State</label><p className="text-white font-medium mt-1">{certificate.court_state}</p></div>}
              {certificate?.court_county && <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filed</label><p className="text-white font-medium mt-1">{certificate.court_county}</p></div>}
              {certificate?.case_number && <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">File Number</label><p className="text-white font-medium mt-1">{certificate.case_number}</p></div>}
              <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date Registered</label><p className="text-white font-medium mt-1">{formatDate(certificate?.purchased_at || '')}</p></div>
              <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date Completed</label><p className="text-white font-medium mt-1">{formatDate(certificate?.completed_at || '')}</p></div>
            </div>

            <div className="border-t border-gray-700 pt-6 flex justify-between items-center">
              <div><label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Certificate Number</label><p className="font-mono text-white mt-1">{certificate?.certificate_number}</p></div>
              <div className="text-right">
                <p className="text-sm font-medium text-white">Geri Jones</p>
                <p className="text-xs text-gray-500">Executive Director</p>
                <p className="text-xs text-gray-500 font-brand">Putting Kids First®</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 px-8 py-4 text-center border-t border-gray-700">
            <p className="text-xs text-gray-500">info@puttingkidsfirst.org • 888-777-2298</p>
          </div>
        </div>

        <button
          onClick={handleDownload}
          className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Descargar Certificado PDF
        </button>

        <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-blue-300 mb-2">Enlace de Verificación para la Corte</h3>
          <p className="text-sm text-blue-400/80 mb-3">Comparta este enlace con su abogado o la corte para verificar instantáneamente su certificado:</p>
          <div className="flex items-center gap-2">
            <input type="text" value={verifyUrl} readOnly className="flex-1 px-4 py-2 bg-[#1a2421] border border-gray-700 rounded-lg text-sm font-mono text-gray-300" />
            <button onClick={() => { navigator.clipboard.writeText(verifyUrl); alert('¡Enlace copiado!'); }} className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors">Copiar</button>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">¿Necesita ayuda? Contáctenos a info@puttingkidsfirst.org</p>
        </div>
      </div>
    </main>
  );
}
