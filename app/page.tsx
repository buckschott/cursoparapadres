'use client';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Home() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (priceId: string, productName: string) => {
    setLoading(productName);
    
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      } else {
        alert('Error al procesar el pago. Por favor, intente de nuevo.');
        setLoading(null);
      }
    } catch (error) {
      alert('Error al procesar el pago. Por favor, intente de nuevo.');
      setLoading(null);
    }
  };

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('scroll-reveal-active');
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach(el => observer.observe(el));

    return () => {
      elements.forEach(el => observer.unobserve(el));
    };
  }, []);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.3,
      rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const devices = [
            { selector: '.device-phone', newSrc: '/phone-2.svg' },
            { selector: '.device-tablet', newSrc: '/tablet-2-es.svg' },
            { selector: '.device-laptop', newSrc: '/laptop-2-es.svg' },
            { selector: '.device-desktop', newSrc: '/desktop-2-es.svg' }
          ];

          devices.forEach((device, index) => {
            setTimeout(() => {
              const deviceEl = document.querySelector(device.selector);
              if (deviceEl) {
                const img = deviceEl.querySelector('.device-img') as HTMLImageElement;
                if (img) {
                  img.src = device.newSrc;
                }
                deviceEl.classList.add('device-active');
              }
            }, index * 800);
          });
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const deviceSection = document.querySelector('.device-phone');
    if (deviceSection) {
      observer.observe(deviceSection);
    }

    return () => {
      if (deviceSection) {
        observer.unobserve(deviceSection);
      }
    };
  }, []);

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-white">
        {/* HERO SECTION */}
        <section className="relative w-full overflow-hidden bg-gradient-to-b from-blue-600 via-sky-400 to-sky-200 hero-section flex justify-center z-0">
          <div className="relative w-full max-w-7xl mx-auto px-4 md:px-6 text-center z-10 flex flex-col justify-between hero-content">
            
            <div>
              <h1 className="hero-title text-5xl md:text-[54px] lg:text-[71px] font-bold text-white leading-[1.1] tracking-wide">
                <span className="hero-line-1">Curso Para Padres</span><br />
                <span className="hero-line-2">Aceptado por la Corte</span>
              </h1>
            </div>

            <div>
              <p className="hero-subheadline text-xl md:text-2xl lg:text-3xl font-normal text-white/90 max-w-4xl mx-auto leading-relaxed">
                <span className="subtext-line subtext-line-1 inline-block opacity-0">Un precio.</span><br />
                <span className="subtext-line subtext-line-2 inline-block opacity-0">Todos los estados.</span><br />
                <span className="subtext-line subtext-line-3 inline-block opacity-0">Sin sorpresas.</span>
              </p>
            </div>

            <div className="flex justify-center">
              <div className="trust-badge-pill inline-flex items-center justify-center gap-2 bg-white/30 backdrop-blur-md border border-white/30 rounded-full px-4 py-3 shadow-[0_0_20px_rgba(125,211,252,0.25)]">
                <span className="relative flex h-4 w-4 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
                </span>
                <span className="trust-badge-text font-semibold text-white">
                  <span className="trust-text-1">El Curso Original en Línea</span>
                  <span className="trust-text-2 absolute left-0 right-0 text-center">De confianza desde 1993</span>
                </span>
              </div>
            </div>

            <div>
              <a 
                href="#precios"
                className="cta-button inline-flex items-center justify-center group px-12 py-5 rounded-full text-2xl font-bold transition-all hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: '#FFC107',
                  color: '#1A2B48',
                  boxShadow: '0 4px 14px 0 rgba(255, 193, 7, 0.39)'
                }}
              >
                Obtener Mi Certificado
              </a>
            </div>

            <div>
              <a 
                href="/garantia"
                className="secondary-cta inline-block text-white/90 hover:text-white text-[19px] font-bold underline decoration-2 underline-offset-4 hover:decoration-white/90 transition-colors"
              >
                Garantía de Aceptación del 100%
              </a>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="caracteristicas" className="relative pt-8 pb-24 bg-white overflow-hidden z-20" aria-labelledby="features-heading">
          <div className="absolute inset-0 opacity-40 pointer-events-none">
            <div className="absolute inset-0 ruled-paper-lines"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 md:px-6 z-10">
            <div className="text-center mb-16">
              <h2 id="caracteristicas-heading" className="scroll-reveal text-xl md:text-4xl font-bold text-gray-900 mb-4">
                100% Aceptado por la Corte, Entrega Inmediata
              </h2>
              <p className="scroll-reveal text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                Nuestro proceso es simple, rápido y garantizado para cumplir con su fecha límite.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: "Aceptado por la Corte",
                  description: "Reconocido por sistemas judiciales de familia en todo el país.",
                  icon: "M269.37,110.78c25.55,2.33,51.79,12.95,74.51,22.10,26.54,10.69,44.16,14.64,70.05,23.73,20.48,7.19,48.34,12.43,63.45,31.20,18.26,22.68,10.91,47.86,3.42,72.74-8.34,27.69-17.60,55.60-29.02,82.00-.28-.77-1.40,5.38-2.25,5.49-16.57,36.66-41.44,42.82-78.42,35.14-18.35-3.81-34.09-5.93-51.38-13.13-12.38-5.16-42.25-14.28-51.18-16.73-26.85-7.70-95.95-16.60-89.31-82.23,1.88-18.57,8.26-39.53,15.21-57.09,7.17-18.12,11.91-38.35,19.81-55.49,11.62-25.23,24.03-40.50,48.84-47.73h6.29Z M269.37,110.78c-11.30-21.88-14.19-59.43,8.65-80.94,19.48-18.35,57.42-21.76,85.25-18.98,50.11,5.00,120.80,27.17,136.69,82.79,9.81,34.36-3.09,72.61-39.33,80.86 M193.79,321.64c-68.63,20.53-34.12,106.82,10.58,129.66,44.03,22.49,133.48,44.05,168.39,22.32,28.46-17.72,34.77-62.41,22.86-87.39 M455.27,335.61c23.67-2.76,49.52,9.61,68.35,21.59,17.86,11.36,36.77,38.90,62.44,27.85,17.06-7.34,25.22-39.97,23.99-57.66-2.03-29.23-25.26-31.11-49.24-34.58-23.83-3.45-60.93-13.23-80.10-28.29 M549.88,290.94c-5.63,18.55-13.72,49.20-25.52,64.93 M612.41,321.10c33.15,11.01,75.76,27.19,108.85,41.19,30.77,13.02,34.35,14.23,63.85,27.64-.54-.42,11.70,6.34,27.08,13.29,42.73,20.53,80.92,44.42,120.64,66.32,27.97,15.43,95.08,59.44,72.67,89.48-19.22,25.76-132.09-34.48-162.79-51.39-34.33-18.91-71.18-38.33-106.43-57.10-39.17-20.87-101.57-49.67-144.24-64.45 M389.17,457.31c63.62,0,155.77,8.90,217.62,18.15,15.14,2.27,71.41,9.33,77.14,27.19,8.40,26.22-54.60,31.21-68.75,34.04-118.22,23.61-247.78,25.96-368.86,19.95-58.57-2.91-146.04-4.18-188.25-41.73-1.47-25.21,152.74-59.47,175.43-51.25 M683.15,513.36c0,20.12,10.42,41.87,15.89,59.53,6.07,19.60,11.64,27.25,20.42,45.03,15.32,31.02,31.26,67.01-.33,94.19-49.59,42.67-141.56,47.43-206.64,50.78-77.70,4.00-157.84,4.66-236.83,3.26-35.94-.64-74.21-6.75-110.03-10.55-35.48-3.76-77.16-9.73-109.24-22.10-32.03-12.35-56.53-40.50-42.19-75.19,13.60-32.87,27.49-62.42,35.11-99.03,2.05-9.83,10.09-34.73,8.76-44.37 M713.47,606.24c-27.64,23.39-98.27,36.25-134.78,43.35-41.50,8.07-82.45,14.78-126.98,16.59-93.94,3.81-185.44-.79-274.55-14.73-28.26-4.42-124.83-22.10-138.96-47.78",
                  viewBox: "0 0 1020 776.82"
                },
                {
                  title: "Certificado Instantáneo",
                  description: "Descargue su certificado oficial de verificación judicial inmediatamente al completar.",
                  icon: "M542.18,305.31c-14.83,4.70-32.41,15.35-39.82,29.03-6.75,12.46-3.58,25.56,4.82,36.98,8.40,11.42,23.34,16.82,37.49,17.60s28.44-1.23,40.32-8.97c15.99-10.41,28.80-28.48,26.41-47.41-2.60-20.68-24.15-36.05-44.94-34.55-10.58.76-18.39,4.70-24.28,7.32Z M530.07,277.93c9.20-16.01,24.60-24.93,43.06-24.87,18.47.06,36.54,10.63,45.65,26.69,8.90-9.10,25.46-4.84,33.31,5.18,7.85,10.02,9.38,23.45,10.61,36.12.96,9.85,1.89,20.05-1.24,29.44-3.13,9.39-11.46,17.81-21.36,17.76-1.20,17.81-10.70,34.88-25.20,45.28-14.50,10.40-33.72,13.93-50.97,9.37-12.78,12.08-34.39,13.31-48.46,2.76-17.03-1.81-35.17-4.08-48.24-15.14-13.07-11.07-17.13-34.26-3.48-44.60-15.22-18.49-15.89-47.47-1.53-66.64,14.35-19.17,45.09-28.24,67.83-21.35Z M548.33,259.37c-2.79-23.48-34.60-41.44-58.23-42.16s-42.69,5.99-65.04,14.93c-13.68,5.47-28.25,10.19-41.55,16.52-3.95,1.88-8.22,4.08-9.92,8.11-2.99,7.08,4.26,14.84,11.82,16.20,7.56,1.36,15.21-1.23,22.86-1.95,20.06-1.89,44.27,12.73,51.81,31.41 M575.87,424.77c2.47,42.52,4.20,93.87,1.15,136.35-.28,3.91-.84,10.45-1.67,16.76-1.09,8.28-18.38-2.61-25.05-7.63-10.01-7.53-19.02-24.10-31.53-24.56-13.44-.50-19.57,11.29-30.52,20.14-10.15,8.20-21.09,21.85-34.01,23.67,25.22-47.84,43.41-111.28,46.28-165.29 M511.79,221.90c102.91-50.03,205.70-118.73,293.98-191.53,11.02-9.09,22.85-18.76,37.07-20.18,23.32-2.33,42.23,17.84,55.91,36.86,29.23,40.67,53.75,85.14,68.36,133.04s19.05,99.42,8.59,148.39c-4.89,22.86-13.97,46.41-32.92,60.10-17.55,12.68-40.34,14.71-61.87,16.99-62.41,6.62-135.73,20.24-195.89,38.10 M487.34,502.54c-110.33,38.91-207.04,129.31-300.90,199.15-17.07,12.70-36.37,25.50-57.60,24.11-24.57-1.60-43.70-21.66-57.56-42.01C11.58,596.14,3.02,483.00,14.21,377.54c1.58-14.92,3.96-30.81,14.02-41.94,14.44-15.98,38.86-16.46,60.40-16.56,96.50-.41,196.31-19.71,287.47-51.35 M144.65,538.21c-6.43,4.54-23.36,9.64-33.15,8.15-6.07-16.13-8.75-35.52-5.61-52.47.97-5.21,3.06-11.11,8.09-12.78,7.29-2.42,13.47,5.72,16.61,12.73,19.32,43.27,23.39,92.00,15.42,138.95-13.27,7.63-24.45,3.68-35.34-4.57-10.88-8.25-18.00-20.62-23.56-33.09-26.25-58.94-27.12-128.11-4.62-188.58,3.67-9.85,8.45-20.06,17.37-25.61,11.92-7.42,24.09-2.28,35.19,6.32s18.03,20.33,24.06,33.01c39.93,84.09,53.26,183.38,36.06,274.86 M115.38,480.16c14.71-8.71,42.24-20.09,58.96-23.66 M578.65,473.20c20.83,30.63,36.69,62.71,61.41,91.91,8.49-22.51,13.13-44.67,14.60-68.68,16.22,9.11,39.17,13.51,57.40,17.25,1.38-13.17-2.91-27.45-1.53-40.62-30.96-26.84-55.18-66.11-68.34-104.92 M314.67,503.82c-1.27,11.68-1.10,22.63-2.17,33.25 M341.94,490.28c2.47,11.00-3.61,19.56-7.30,30.21 M367.32,479.17c.66,10.29,1.83,15.24-2.32,24.09 M746.61,356.07c1.05,10.86.85,18.49,0,29.36 M287.03,524.29c-.13,11.62-.53,21.68,2.49,32.02 M785.38,352.66c-5.85,8.82-10.76,19.88-11.28,30.45",
                  viewBox: "0 0 991.43 735.91"
                },
                {
                  title: "Acceso Inmediato",
                  description: "Comience inmediatamente después de inscribirse. Sin programación, sin esperas. Empiece en minutos.",
                  icon: "M864.04,312.39c-223.76,231.76-239.76,251.45-497.94,497.76-105.94-98.18-116.61-111.03-209.67-211.84,44.34-53.13,51.61-58.47,103.49-102.10,59.15,45.33,108.38,103.22,108.77,103.80,126.22-133.54,257.68-265.64,393.37-389.86,51.07,44.36,58.07,51.86,101.98,102.24Z M1010.22,510.25c-5.46,154.58-74.13,293.54-180.55,384.66-85.58,73.28-203.14,113.92-319.45,115.34-134.55,1.64-258.17-51.66-346.59-139.61C74.41,781.89,16.35,645.85,10.22,510.25c-3.71-82.01,40.27-228.24,110.17-313.13C213.44,84.12,352.09,15.88,510.22,10.25c114.12-4.06,217.39,41.04,303.61,102.70,114.63,81.99,202.01,237.92,196.39,397.30Z",
                  viewBox: "0 0 1020.47 1020.29"
                },
                {
                  title: "Acceso 24/7",
                  description: "Acceda a su curso en cualquier momento, día o noche. Aprenda en su horario, cuando le convenga.",
                  icon: "M269.49,386.61c14.36-28.24,37.10-53.87,67.22-63.71,30.12-9.84,67.80.21,83.02,28.00,14.20,25.92,6.16,58.18-5.18,85.47-30.32,73.05-82.45,136.89-147.96,181.21,11.79-18.85,39.24-20.69,60.21-13.32,20.97,7.38,39.16,21.49,60.40,28.09,21.23,6.60,48.93,2.49,58.55-17.55 M678.00,624.30c-3.61-107.49,2.32-215.31,17.70-321.76-65.78,74.98-125.10,155.62-177.09,240.74,76.13-1.83,152.26-3.65,228.38-5.48 M565.00,718.06c5.05,37.71,10.10,75.41,15.15,113.12l-15.15-113.12Z M571.45,747.58c13.27-24.65,43.46-38.91,70.93-33.50 M421.37,682.08c11.14,50.76,14.54,103.20,10.04,154.97 M430.55,745.96c6.43-17.72,29.72-25.27,47.26-18.37,17.54,6.90,28.95,24.74,32.85,43.18,3.90,18.44,1.41,37.58-1.77,56.16 M231.95,166.61c.73-30.77-14.94-61.47-40.29-78.92-17.79-12.25-42.88-23.03-42.73-44.63.09-12.93,10.63-23.93,22.66-28.67,12.03-4.74,25.36-4.54,38.30-4.27,69.96,1.46,139.91,2.92,209.87,4.38,20.25.42,43.58,2.40,55.28,18.92,8.54,12.06,7.83,28.82,1.86,42.35-5.97,13.52-16.42,24.48-26.85,34.95-53.54,53.71-112.13,102.40-174.74,145.20-9.90,6.77-23.70,13.31-32.91,5.61-5.89-4.93-6.74-13.51-7.16-21.18-1.64-30.38-3.59-60.76-3.28-73.74Z M787.09,205.52c14.65,1.39,26.79,15.82,25.65,30.50-1.14,14.67-15.36,27.06-30.05,26.17-14.69-.89-27.32-14.89-26.68-29.60s14.49-28.65,31.09-27.07Z M900.79,493.72c-4.40,3.65-8.80,7.29-13.20,10.94-8.74,15.88,3.50,38.89,21.56,40.51,18.06,1.62,34.20-18.84,28.43-36.02-5.77-17.18-28.98-21.89-36.78-15.43Z M785.41,798.52c-14.38,4.13-22.66,22.28-16.61,35.96,6.05,13.68,24.74,19.82,37.87,12.65,13.12-7.18,18.10-25.93,10.52-38.82-7.58-12.89-26.10-17.71-31.77-9.78Z M500.06,898.76c14.45,1.93,25.98,16.50,24.55,31.00-1.44,14.50-15.61,26.53-30.15,25.59s-27.05-14.69-26.60-29.26c.44-14.57,13.92-29.78,32.21-27.34Z M172.06,806.11c2.48-16.99,25.13-27.18,39.48-17.76,14.35,9.42,14.02,34.25-.58,43.29-14.60,9.03-42.35-1.92-38.90-25.53Z M61.17,513.52c-5.39,12.14,3.71,28.16,16.87,29.97,13.16,1.81,26.18-10.87,24.94-24.09-1.24-13.22-16.10-23.25-28.89-19.67s-20.30,19.60-12.92,13.78Z M153.82,246.23c8.35-15.43,34.01-16.70,43.83-2.16,9.82,14.54-.93,37.87-18.37,39.85-17.43,1.98-35.36-19.39-25.46-37.69Z M226.71,134.02C117.35,187.49,43.64,299.86,19.38,419.14c-33.55,164.98,24.55,345.60,147.99,460.08,123.44,114.48,307.93,158.81,469.92,112.94,55.81-15.81,108.68-41.49,156.42-74.42,57.08-39.38,107.13-89.44,143.94-148.21,85.29-136.16,91.76-318.07,16.36-459.94s-229.78-238.30-390.35-243.80",
                  viewBox: "0 0 1016.39 1020"
                }
              ].map((feature, i) => (
                <article key={i} className="scroll-reveal group p-8 rounded-2xl border border-gray-200 md:hover:border-blue-200 md:hover:shadow-xl transition-all duration-300 md:hover:-translate-y-1 bg-white">
                  <div className="w-16 h-16 mb-6 relative overflow-visible">
                    <svg className="draw-svg w-full h-full" viewBox={feature.viewBox} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      {feature.icon.split(' M').map((d, j) => (
                        <path key={j} d={j === 0 ? d : 'M' + d} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="20"/>
                      ))}
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 md:group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
        
        {/* DEVICES SECTION */}
        <section className="relative bg-gradient-to-b from-gray-50 to-white overflow-hidden z-20 py-24 pt-32" aria-labelledby="devices-heading">
          <div className="relative max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 id="dispositivos-heading" className="scroll-reveal text-lg md:text-4xl font-bold text-gray-900 mb-4">
                Funciona en cualquier<br className="md:hidden" /> dispositivo
              </h2>
              <p className="scroll-reveal text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                Comience en su teléfono, continúe en su computadora. Su progreso se sincroniza perfectamente en todos los dispositivos.
              </p>
            </div>

            <div className="flex justify-center gap-4 md:gap-12 max-w-4xl mx-auto">
              {[
                { name: 'phone', label: 'Teléfono', size: 'w-12 h-12 md:w-[54px] md:h-[54px]', container: 'w-12 md:w-[54px]' },
                { name: 'tablet', label: 'Tableta', size: 'w-16 h-16 md:w-[84px] md:h-[84px]', container: 'w-16 md:w-[84px]' },
                { name: 'laptop', label: 'Portátil', size: 'w-20 h-20 md:w-32 md:h-32', container: 'w-20 md:w-32' },
                { name: 'desktop', label: 'Escritorio', size: 'w-24 h-24 md:w-36 md:h-36', container: 'w-24 md:w-36' }
              ].map((device) => (
                <div key={device.name} className={`device-animate device-${device.name} flex flex-col items-center gap-3`}>
                  <div className={`relative h-28 md:h-40 ${device.container}`}>
                    <img src={`/${device.name}.svg`} alt={device.label} className={`device-img ${device.size} absolute bottom-0 left-0`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section id="precios" className="relative bg-white z-20 overflow-hidden py-24" aria-labelledby="pricing-heading">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 id="precios-heading" className="scroll-reveal text-lg md:text-4xl font-bold text-gray-900 mb-4">Clases de Crianza Aceptadas por la Corte</h2>
              <p className="scroll-reveal text-lg text-gray-600">Encuentre el programa garantizado y aceptado para sus requisitos específicos.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Coparenting Class - Active */}
              <article className="relative bg-white rounded-2xl border-2 border-gray-300 p-8 transition-all md:hover:shadow-2xl md:hover:border-blue-400">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">Clase de Coparentalidad</h3>
                  <p className="text-sm text-gray-600">Para Divorcio, Separación y Custodia</p>
                </div>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">$60</span>
                  <p className="text-sm text-gray-500 mt-2">Pago único</p>
                </div>
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Cumple con los requisitos para:</h4>
                  <ul className="space-y-2">
                    {["Procedimientos de divorcio", "Disputas de custodia", "Casos de derechos parentales", "Modificaciones de custodia"].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        <span className="text-gray-700 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button 
                  onClick={() => handleCheckout(process.env.NEXT_PUBLIC_PRICE_COPARENTING!, 'coparenting')}
                  disabled={loading === 'coparenting'}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold md:hover:bg-blue-700 transition-all md:hover:shadow-xl mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading === 'coparenting' ? 'Procesando...' : 'Obtener Mi Certificado'}
                </button>
                <div className="mb-6 pt-4 border-t border-gray-200">
                  <h4 className="text-xs font-semibold text-gray-900 mb-2">Incluye:</h4>
                  <ul className="space-y-2">
                    {["Garantía de Aceptación del 100%", "El Curso Original en Línea (Desde 1993)", "100% en Línea y a Su Ritmo", "Certificado Instantáneo con Código de Verificación Judicial"].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        <span className="text-gray-600 text-xs">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-xs font-semibold text-gray-900 mb-2">Detalles del Curso:</h4>
                  <p className="text-gray-600 text-xs leading-relaxed italic">
                    "Esta clase proporciona las habilidades esenciales para cambiar su enfoque del conflicto personal del divorcio a las necesidades de su hijo, ayudándole a crear un ambiente de 'dos hogares' estable, de apoyo y sin amenazas."
                  </p>
                </div>
              </article>

              {/* Parenting Class - Coming Soon */}
              <article className="relative bg-white rounded-2xl border-2 border-gray-200 p-8 opacity-75">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">PRÓXIMAMENTE</span>
                </div>
                <div className="mb-6 mt-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">Clase de Crianza</h3>
                  <p className="text-sm text-gray-600">Para Habilidades Fundamentales y Estabilidad del Hogar</p>
                </div>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-400">$60</span>
                  <p className="text-sm text-gray-500 mt-2">Pago único</p>
                </div>
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Cumple con los requisitos para:</h4>
                  <ul className="space-y-2">
                    {["Demostrar crianza positiva en la corte", "Crear un hogar estable y nutritivo", "Desarrollar autoestima infantil y disciplina positiva", "Procedimientos de adopción o cuidado temporal"].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        <span className="text-gray-500 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button disabled className="w-full bg-gray-300 text-gray-500 py-4 rounded-xl font-bold cursor-not-allowed mb-6">Próximamente</button>
                <div className="mb-6 pt-4 border-t border-gray-200">
                  <h4 className="text-xs font-semibold text-gray-900 mb-2">Incluye:</h4>
                  <ul className="space-y-2">
                    {["Garantía de Aceptación del 100%", "El Curso Original en Línea (Desde 1993)", "100% en Línea y a Su Ritmo", "Certificado Instantáneo con Código de Verificación Judicial"].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        <span className="text-gray-400 text-xs">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-xs font-semibold text-gray-900 mb-2">Detalles del Curso:</h4>
                  <p className="text-gray-400 text-xs leading-relaxed italic">
                    "Esta clase proporciona habilidades fundamentales de crianza para crear un hogar seguro, estable y nutritivo, ayudándole a desarrollar la autoestima de su hijo y manejar la disciplina de manera efectiva."
                  </p>
                </div>
              </article>
            </div>

            {/* Bundle - Coming Soon */}
            <div className="max-w-4xl mx-auto mt-16 mb-14">
              <article className="relative bg-white rounded-2xl border-2 border-gray-200 p-8 opacity-75">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">PRÓXIMAMENTE</span>
                </div>
                <div className="mb-6 mt-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">El Paquete Completo</h3>
                  <p className="text-sm text-gray-600">Demuestre Su Compromiso Total</p>
                </div>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-400">$80</span>
                  <p className="text-sm text-gray-500 mt-2">Pago único • Ahorre $40</p>
                </div>
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Incluye ambas clases:</h4>
                  <ul className="space-y-2">
                    {["Clase de Coparentalidad (Para Divorcio y Custodia)", "Clase de Habilidades de Crianza (Para Habilidades Fundamentales y Estabilidad del Hogar)", "Cumple con requisitos combinados o de nivel superior", "Garantía de Aceptación del 100%"].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        <span className="text-gray-500 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button disabled className="w-full bg-gray-300 text-gray-500 py-4 rounded-xl font-bold cursor-not-allowed">Próximamente</button>
              </article>
            </div>

            <div className="text-center mt-12">
              <p className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Transacción SSL 100% Segura
              </p>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS SECTION */}
        <section id="testimonios" className="py-24 bg-white relative z-20" aria-labelledby="testimonials-heading">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 id="testimonios-heading" className="text-lg md:text-4xl font-bold text-gray-900 mb-4">Confiado por Padres, Aceptado por Cortes</h2>
              <p className="text-lg text-gray-600">Vea cómo padres como usted cumplieron con sus requisitos—rápidamente.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                { name: "Roberto Méndez", location: "Houston, Texas", text: "Mi abogado me recomendó Putting Kids First específicamente. La corte aceptó mi certificado sin ninguna pregunta. Lo completé en un solo fin de semana." },
                { name: "Lucía Fernández", location: "Atlanta, Georgia", text: "Como madre soltera con dos trabajos, necesitaba algo flexible. Hice todo el curso en mi teléfono entre turnos. El certificado llegó a mi correo al instante." },
                { name: "Miguel Torres", location: "Jacksonville, Florida", text: "Esperaba solo cumplir con un requisito del tribunal. Realmente aprendí cosas que me ayudaron a ser mejor padre. Valió la pena." }
              ].map((review, i) => (
                <article key={i} className="bg-white border-2 border-gray-200 rounded-2xl p-8 md:hover:border-blue-200 md:hover:shadow-xl transition-all">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">"{review.text}"</p>
                  <div className="border-t border-gray-200 pt-4">
                    <p className="font-semibold text-gray-900">{review.name}</p>
                    <p className="text-sm text-gray-500">{review.location}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="preguntas-frecuentes" className="py-24 bg-gradient-to-b from-white to-gray-50 relative z-20" aria-labelledby="faq-heading">
          <div className="max-w-4xl mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 id="preguntas-frecuentes-heading" className="text-lg md:text-4xl font-bold text-gray-900 mb-4">Su Lista de Verificación Final</h2>
              <p className="text-lg text-gray-600">Detalles clave sobre la aceptación de la corte, su certificado y el acceso al curso.</p>
            </div>
            
            <div className="space-y-4">
              {[
                { question: "¿Mi corte aceptará este certificado?", answer: "Sí. Nuestro programa está respaldado por una Garantía de Aceptación del 100%. Nuestras clases están diseñadas para cumplir con los requisitos de la corte. Si su certificado no es aceptado por cualquier razón, le proporcionaremos un reembolso completo." },
                { question: "¿Cuándo recibo mi certificado?", answer: "Inmediatamente. En el momento en que complete la revisión final del curso, su certificado está listo para ser descargado, impreso o enviado por correo electrónico directamente a su abogado." },
                { question: "¿Cuánto tiempo toma el curso?", answer: "Las clases de Coparentalidad y Crianza están diseñadas cada una para cumplir con un requisito de la corte de 4 horas. El Paquete Completo es nuestro programa más completo, diseñado para satisfacer requisitos combinados o de nivel superior.\n\nTodas nuestras clases son 100% a su propio ritmo, por lo que puede iniciar y cerrar sesión según sea necesario para completar el trabajo en su horario." }
              ].map((faq, i) => (
                <details key={i} className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden group md:hover:border-blue-200 transition-colors">
                  <summary className="flex justify-between items-center cursor-pointer p-6 font-bold text-gray-900 text-lg select-none">
                    <span>{faq.question}</span>
                    <svg className="w-6 h-6 text-gray-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-6 pb-6 pt-2">
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}