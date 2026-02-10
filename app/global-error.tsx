'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body>
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(to bottom, #2563eb, #38bdf8, #bae6fd)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            padding: '3rem',
            maxWidth: '32rem',
            width: '100%',
            textAlign: 'center'
          }}>
            <div style={{
              width: '4rem',
              height: '4rem',
              background: '#fee2e2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>

            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '1rem'
            }}>
              Error del Sistema
            </h1>

            <p style={{
              color: '#6b7280',
              marginBottom: '2rem'
            }}>
              Lo sentimos, hubo un problema grave. Por favor, recargue la página o vuelva a intentarlo más tarde.
            </p>

            <button
              onClick={reset}
              style={{
                width: '100%',
                background: '#2563eb',
                color: 'white',
                padding: '1rem',
                borderRadius: '0.75rem',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                marginBottom: '0.75rem',
                fontSize: '1rem'
              }}
            >
              Recargar Página
            </button>

            <a
              href="/"
              style={{
                display: 'block',
                width: '100%',
                background: '#f3f4f6',
                color: '#374151',
                padding: '1rem',
                borderRadius: '0.75rem',
                fontWeight: 'bold',
                textDecoration: 'none',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            >
              Volver al Inicio
            </a>

            <p style={{
              color: '#9ca3af',
              fontSize: '0.875rem',
              marginTop: '1.5rem'
            }}>
              ¿Necesita ayuda? <a href="mailto:hola@claseparapadres.com" style={{ color: '#2563eb' }}>Contáctenos</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
