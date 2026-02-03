'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function AuthRedirectHandler({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // Check URL hash for recovery token (Supabase puts tokens in hash)
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      router.push('/actualizar-contrasena' + hash);
      return;
    }

    // Also listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        router.push('/actualizar-contrasena');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return <>{children}</>;
}
