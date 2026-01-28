import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  const code = params.code;
  
  if (!code) {
    return NextResponse.json({ error: 'Missing verification code' }, { status: 400 });
  }

  const supabase = createServerClient();

  // Look up certificate by verification code (case-insensitive)
  const { data: cert, error: certError } = await supabase
    .from('certificates')
    .select('certificate_number, participant_name, course_type, issued_at, user_id')
    .ilike('verification_code', code)
    .single();

  if (certError || !cert) {
    return NextResponse.json({ found: false }, { status: 404 });
  }

  // Get profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('legal_name, court_state, court_county, case_number')
    .eq('id', cert.user_id)
    .single();

  // Get course progress for dates
  const { data: progress } = await supabase
    .from('course_progress')
    .select('started_at, completed_at')
    .eq('user_id', cert.user_id)
    .eq('course_type', cert.course_type)
    .single();

  // Get purchase date
  const { data: purchases } = await supabase
    .from('purchases')
    .select('purchased_at')
    .eq('user_id', cert.user_id)
    .or(`course_type.eq.${cert.course_type},course_type.eq.bundle`)
    .limit(1);

  return NextResponse.json({
    found: true,
    certificate: {
      certificate_number: cert.certificate_number,
      participant_name: cert.participant_name || '',
      legal_name: profile?.legal_name || cert.participant_name || 'Not provided',
      course_type: cert.course_type,
      court_state: profile?.court_state || '',
      court_county: profile?.court_county || '',
      case_number: profile?.case_number || '',
      issued_at: cert.issued_at,
      purchased_at: purchases?.[0]?.purchased_at || cert.issued_at,
      completed_at: progress?.completed_at || cert.issued_at,
    },
  });
}
