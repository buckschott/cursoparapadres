/**
 * PricingCard — Single-class pricing card for homepage.
 * 
 * Extracts the repeated structure shared between the Coparenting
 * and Parenting cards. Differences are passed as props.
 */

interface PricingCardProps {
  title: string;
  subtitle: string;
  price: string;
  requirements: string[];
  loadingKey: string;
  loading: string | null;
  onEnroll: () => void;
}

export default function PricingCard({
  title,
  subtitle,
  price,
  requirements,
  loadingKey,
  loading,
  onEnroll,
}: PricingCardProps) {
  const isLoading = loading === loadingKey;

  return (
    <article className="relative bg-background rounded-2xl border-2 border-[#FFFFFF]/20 p-8 shadow-xl shadow-black/40 transition-all md:hover:shadow-2xl md:hover:border-[#FFFFFF]/50">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-base text-[#7EC8E3] font-medium">{subtitle}</p>
      </div>
      <div className="mb-6">
        <span className="text-5xl font-bold text-white">{price}</span>
        <p className="text-sm text-white/65 mt-2">Pago único</p>
      </div>
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-white mb-3">Cumple con los requisitos para:</h4>
        <ul className="space-y-2">
          {requirements.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#7EC8E3]" />
              <span className="text-white text-sm">{item}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <button 
        onClick={onEnroll}
        disabled={isLoading}
        className="group w-full border-2 border-[#7EC8E3] text-[#7EC8E3] bg-transparent py-4 rounded-xl font-bold transition-all duration-200 hover:bg-[#7EC8E3]/10 hover:shadow-lg hover:shadow-[#7EC8E3]/20 active:scale-[0.98] active:bg-[#7EC8E3]/15 mb-6 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <LoadingSpinner />
            <span>Conectando...</span>
          </>
        ) : (
          <>
            <span>Inscríbase Ahora</span>
            <svg 
              className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1 group-active:translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </>
        )}
      </button>
      
      <div className="mb-6 pt-4 border-t border-[#FFFFFF]/15">
        <h4 className="text-xs font-semibold text-white mb-2">Incluye:</h4>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <CheckIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#77DD77]" />
            <span className="text-white/70 text-xs">
              Aceptado por Tribunales en Todo el País{' '}
              <a 
                href="/aceptacion-de-la-corte" 
                className="text-[#7EC8E3] hover:underline"
              >
                Ver detalles →
              </a>
            </span>
          </li>
          {["Cumple Requisitos de 4-6 Horas", "Acceso 24/7. A Su Ritmo.", "Certificado Verificable con Código de Seguridad", "Notificamos a Su Abogado al Completar"].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#77DD77]" />
              <span className="text-white/70 text-xs">{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="pt-4 border-t border-[#FFFFFF]/15">
        <h4 className="text-xs font-semibold text-white mb-2">Nuestra Promesa</h4>
        <p className="text-white/70 text-xs leading-relaxed">
          Su requisito cumplido. Su certificado entregado. Su tiempo respetado.
        </p>
      </div>
    </article>
  );
}

// ============================================
// INLINE ICONS (co-located with the component that uses them)
// ============================================

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg 
      className="w-5 h-5 animate-spin" 
      viewBox="0 0 24 24" 
      fill="none"
      aria-hidden="true"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="3"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
