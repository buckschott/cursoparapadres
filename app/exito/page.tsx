'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return (
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Algo Salió Mal</h1>
        <p className="text-xl text-gray-600 mb-8">No pudimos verificar su pago.</p>
        <Link href="/" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700">
          Volver al Inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl w-full text-center">
      <div className="mb-8">
        <div className="w-24 h-24 bg-green-500 rounded-full mx-auto flex items-center justify-center">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">¡Todo listo!</h1>
      <p className="text-xl text-gray-600 mb-8 leading-relaxed">
        Su curso está listo. Puede comenzar ahora o regresar en cualquier momento — su progreso se guardará automáticamente.
      </p>
      <Link href="/panel" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors mb-6">
        Comenzar el Curso
      </Link>
      <p className="text-sm text-gray-500">Un correo de confirmación está en camino. Si no lo ve, revise su carpeta de correo no deseado (spam o junk).</p>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-6 py-12">
      <Suspense fallback={<div>Cargando...</div>}>
        <SuccessContent />
      </Suspense>
    </main>
  );
}