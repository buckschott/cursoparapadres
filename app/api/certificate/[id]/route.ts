import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

// Certificate validity period in months
const CERTIFICATE_VALIDITY_MONTHS = 12;

/**
 * Check if certificate is expired (older than 12 months)
 */
function isCertificateExpired(issuedAt: string): boolean {
  const issueDate = new Date(issuedAt);
  const expirationDate = new Date(issueDate);
  expirationDate.setMonth(expirationDate.getMonth() + CERTIFICATE_VALIDITY_MONTHS);
  return new Date() > expirationDate;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // ============================================
  // AUTH CHECK - Verify user owns this certificate
  // ============================================
  const cookieStore = await cookies();
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );
  
  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized - Please log in' }, 
      { status: 401 }
    );
  }
  
  // ============================================
  // FETCH CERTIFICATE (with user_id check)
  // ============================================
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const { data: cert } = await supabase
    .from('certificates')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)  // ✅ Security: Only fetch if user owns it
    .single();

  if (!cert) {
    return NextResponse.json(
      { error: 'Certificate not found or access denied' }, 
      { status: 404 }
    );
  }

  // ============================================
  // CHECK EXPIRATION
  // ============================================
  if (isCertificateExpired(cert.issued_at)) {
    return NextResponse.json(
      { error: 'Certificate has expired. Please enroll again for a new certificate.' }, 
      { status: 410 } // 410 Gone
    );
  }

  // ============================================
  // FETCH RELATED DATA
  // ============================================
  
  // Get participant name from certificate (legal_name from profile at time of creation)
  // Court info is now stored directly on certificate
  const { data: profile } = await supabase
    .from('profiles')
    .select('legal_name')
    .eq('id', cert.user_id)
    .single();

  const { data: progress } = await supabase
    .from('course_progress')
    .select('started_at, completed_at')
    .eq('user_id', cert.user_id)
    .eq('course_type', cert.course_type)
    .single();

  const { data: purchase } = await supabase
    .from('purchases')
    .select('purchased_at')
    .eq('user_id', cert.user_id)
    .or(`course_type.eq.${cert.course_type},course_type.eq.bundle`)
    .limit(1);

  const purchaseDate = purchase?.[0]?.purchased_at || cert.issued_at;
  const completionDate = progress?.completed_at || cert.issued_at;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // ============================================
  // BUILD CERTIFICATE DATA
  // Court info now comes from CERTIFICATE, not profile
  // ============================================
  const certData = {
    participantName: cert.participant_name || profile?.legal_name || '',
    state: cert.court_state || '',        // ✅ From certificate
    county: cert.court_county || '',      // ✅ From certificate
    caseNumber: cert.case_number || '',   // ✅ From certificate
    dateRegistered: formatDate(purchaseDate),
    dateCompleted: formatDate(completionDate),
    certificateNumber: cert.certificate_number,
    verificationCode: cert.verification_code,
    verifyUrl: `https://www.claseparapadres.com/verificar/${cert.verification_code}`
  };

  // ============================================
  // CREATE PDF
  // ============================================
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // Letter size in points
  
  // Embed fonts
  const courierBold = await pdfDoc.embedFont(StandardFonts.CourierBold);
  const courier = await pdfDoc.embedFont(StandardFonts.Courier);
  
  const { width, height } = page.getSize();
  const margin = 54; // 0.75 inch
  const logoX = margin; // Logo left edge position

  // Title - CERTIFICATE OF COMPLETION
  const titleSize = 48;
  const title1 = 'CERTIFICATE OF';
  const title2 = 'COMPLETION';
  const title1Width = courierBold.widthOfTextAtSize(title1, titleSize);
  const title2Width = courierBold.widthOfTextAtSize(title2, titleSize);
  
  page.drawText(title1, {
    x: (width - title1Width) / 2,
    y: height - 75,
    size: titleSize,
    font: courierBold,
    color: rgb(0, 0, 0),
  });
  
  page.drawText(title2, {
    x: (width - title2Width) / 2,
    y: height - 125,
    size: titleSize,
    font: courierBold,
    color: rgb(0, 0, 0),
  });
  
  // Horizontal line under title
  const topLineY = height - 150;
  page.drawLine({
    start: { x: margin, y: topLineY },
    end: { x: width - margin, y: topLineY },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  
  // Dynamic course title and subtitle based on course_type
  const courseMain = cert.course_type === 'parenting' ? 'Parenting Class' : 'Co-Parenting Class';
  const courseSub = cert.course_type === 'parenting' ? 'Child Development & Parenting Skills' : 'Parent Education and Family Stabilization Course';
  const courseMainSize = 28;
  const courseSubSize = 11;
  const courseMainWidth = courierBold.widthOfTextAtSize(courseMain, courseMainSize);
  const courseSubWidth = courier.widthOfTextAtSize(courseSub, courseSubSize);
  
  page.drawText(courseMain, {
    x: (width - courseMainWidth) / 2,
    y: height - 185,
    size: courseMainSize,
    font: courierBold,
    color: rgb(0, 0, 0),
  });
  
  page.drawText(courseSub, {
    x: (width - courseSubWidth) / 2,
    y: height - 205,
    size: courseSubSize,
    font: courier,
    color: rgb(0, 0, 0),
  });
  
  // Horizontal line under course
  const secondLineY = height - 225;
  page.drawLine({
    start: { x: margin, y: secondLineY },
    end: { x: width - margin, y: secondLineY },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  
  // Footer section measurements
  const logoHeight = 126; // 1.75 inches
  const bottomLineY = 50;
  const logoBottomY = bottomLineY + 20; // 20pt above bottom line
  const logoTopY = logoBottomY + logoHeight;
  const footerLineY = logoTopY + 20; // 20pt above logo
  
  // QR code measurements (define early for use in signature section)
  const qrSize = 60;
  const qrX = width - margin - qrSize;
  const qrY = 105;
  const qrCenterY = qrY + qrSize / 2;
  
  // Fields
  const fields = [
    { label: 'NAME:', value: certData.participantName },
    { label: 'STATE:', value: certData.state },
    { label: 'FILED:', value: certData.county },
    { label: 'FILE NUMBER:', value: certData.caseNumber },
    { label: 'DATE REGISTERED:', value: certData.dateRegistered },
    { label: 'DATE COMPLETED:', value: certData.dateCompleted },
  ];
  
  const labelSize = 12;
  const valueSize = 12;
  
  // Field spacing
  const rowHeight = 50;
  const totalFieldsHeight = (fields.length - 1) * rowHeight;
  const fieldAreaTop = secondLineY - 20;
  const fieldAreaBottom = footerLineY + 20;
  const availableSpace = fieldAreaTop - fieldAreaBottom;
  const startY = fieldAreaBottom + availableSpace / 2 + totalFieldsHeight / 2 - 5; // -5 to move down
  
  // Find the longest label to calculate colon position
  const longestLabel = 'DATE REGISTERED:';
  const maxLabelWidth = courierBold.widthOfTextAtSize(longestLabel, labelSize);
  
  // Align labels so "D" of DATE REGISTERED aligns with logo left edge
  const labelStartX = logoX;
  const colonX = labelStartX + maxLabelWidth;
  const valueX = colonX + 15;
  
  let yPos = startY;
  
  for (const field of fields) {
    const labelWidth = courierBold.widthOfTextAtSize(field.label, labelSize);
    
    // Right-align label (BOLD)
    page.drawText(field.label, {
      x: colonX - labelWidth,
      y: yPos,
      size: labelSize,
      font: courierBold,
      color: rgb(0, 0, 0),
    });
    
    // Left-align value
    page.drawText(field.value, {
      x: valueX,
      y: yPos,
      size: valueSize,
      font: courier,
      color: rgb(0, 0, 0),
    });
    
    yPos -= rowHeight;
  }
  
  // Footer line
  page.drawLine({
    start: { x: margin, y: footerLineY },
    end: { x: width - margin, y: footerLineY },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  // Fetch and embed logo
  let logoWidth = 95;
  try {
    const logoResponse = await fetch('https://www.claseparapadres.com/logo.png');
    if (logoResponse.ok) {
      const logoBytes = await logoResponse.arrayBuffer();
      const logoImage = await pdfDoc.embedPng(logoBytes);
      const logoScale = logoHeight / logoImage.height;
      logoWidth = logoImage.width * logoScale;
      page.drawImage(logoImage, {
        x: logoX,
        y: logoBottomY,
        width: logoWidth,
        height: logoHeight,
      });
    }
  } catch (e) {
    // Logo failed to load
  }
  
  // Signature and Executive Director - next to logo
  const sigAreaX = logoX + logoWidth + 30;
  
  // Fetch and embed signature - 2pt above Executive Director line
  try {
    const sigResponse = await fetch('https://www.claseparapadres.com/geri-signature.png');
    if (sigResponse.ok) {
      const sigBytes = await sigResponse.arrayBuffer();
      const sigImage = await pdfDoc.embedPng(sigBytes);
      const sigHeight = 30;
      const sigScale = sigHeight / sigImage.height;
      const sigWidth = sigImage.width * sigScale;
      page.drawImage(sigImage, {
        x: sigAreaX,
        y: qrCenterY - 4 + 9, // 2pt above Executive Director (which is at qrCenterY - 4 + 10)
        width: sigWidth,
        height: sigHeight,
      });
    }
  } catch (e) {
    // Signature failed to load
  }
  
  // Executive Director - aligned with CERTIFICATE NUMBER
  page.drawText('Executive Director', {
    x: sigAreaX,
    y: qrCenterY - 4, // Same line as CERTIFICATE NUMBER
    size: 10,
    font: courier,
    color: rgb(0, 0, 0),
  });
  
  // Putting Kids First - aligned with certificate number value
  page.drawText('Putting Kids First', {
    x: sigAreaX,
    y: qrCenterY - 18, // Same line as PKF-2025-XXXXX
    size: 10,
    font: courier,
    color: rgb(0, 0, 0),
  });

  // Fetch and embed QR code
  try {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&format=png&data=${encodeURIComponent(certData.verifyUrl)}`;
    const qrResponse = await fetch(qrUrl);
    if (qrResponse.ok) {
      const qrBytes = await qrResponse.arrayBuffer();
      const qrImage = await pdfDoc.embedPng(qrBytes);
      page.drawImage(qrImage, {
        x: qrX,
        y: qrY,
        width: qrSize,
        height: qrSize,
      });
    }
  } catch (e) {
    // QR failed to load
  }
  
  // Certificate number - to the left of QR code, centered vertically
  const certNumX = qrX - 35;
  const certNumLabel = 'CERTIFICATE NUMBER';
  const certNumLabelWidth = courier.widthOfTextAtSize(certNumLabel, 10);
  const certNumWidth = courier.widthOfTextAtSize(certData.certificateNumber, 10);
  
  page.drawText(certNumLabel, {
    x: certNumX - certNumWidth - (certNumLabelWidth - certNumWidth) / 2,
    y: qrCenterY - 4,
    size: 10,
    font: courier,
    color: rgb(0, 0, 0),
  });
  page.drawText(certData.certificateNumber, {
    x: certNumX - certNumWidth,
    y: qrCenterY - 18,
    size: 10,
    font: courier,
    color: rgb(0, 0, 0),
  });
  
  // QR label - centered under QR code
  const qrLabel = 'scan to verify';
  const qrLabelWidth = courier.widthOfTextAtSize(qrLabel, 7);
  const qrCenterX = qrX + qrSize / 2;
  page.drawText(qrLabel, {
    x: qrCenterX - qrLabelWidth / 2,
    y: qrY - 10,
    size: 7,
    font: courier,
    color: rgb(0, 0, 0),
  });
  
  // Bottom contact info
  page.drawLine({
    start: { x: margin, y: bottomLineY },
    end: { x: width - margin, y: bottomLineY },
    thickness: 0.5,
    color: rgb(0, 0, 0),
  });
  
  const contactLine = 'info@puttingkidsfirst.org          888-777-2298';
  const contactWidth = courier.widthOfTextAtSize(contactLine, 10);
  
  page.drawText(contactLine, {
    x: (width - contactWidth) / 2,
    y: 32,
    size: 10,
    font: courier,
    color: rgb(0, 0, 0),
  });
  
  // Generate PDF bytes
  const pdfBytes = await pdfDoc.save();
  
  // Return PDF
  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="certificate-${certData.certificateNumber}.pdf"`,
    },
  });
}
