import { NextRequest, NextResponse } from 'next/server';

// USPS Web Tools Address Validation API
// Register for free at: https://registration.shippingapis.com/
// Set USPS_USER_ID in .env.local

const USPS_USER_ID = process.env.USPS_USER_ID;

export async function POST(request: NextRequest) {
  try {
    if (!USPS_USER_ID) {
      return NextResponse.json(
        { error: 'USPS_USER_ID not configured. Register at https://registration.shippingapis.com/' },
        { status: 500 }
      );
    }

    const { address, city, state, zip } = await request.json();

    if (!address || !city || !state) {
      return NextResponse.json(
        { error: 'Address, city, and state are required' },
        { status: 400 }
      );
    }

    // Parse ZIP into zip5 and zip4
    const zipParts = (zip || '').replace(/\s/g, '').split('-');
    const zip5 = zipParts[0] || '';
    const zip4 = zipParts[1] || '';

    // Build USPS XML request
    // Note: USPS API has Address1 = apt/suite, Address2 = street (counterintuitive)
    const xml = `<AddressValidateRequest USERID="${USPS_USER_ID}"><Address><Address1/><Address2>${escapeXml(address)}</Address2><City>${escapeXml(city)}</City><State>${escapeXml(state)}</State><Zip5>${escapeXml(zip5)}</Zip5><Zip4>${escapeXml(zip4)}</Zip4></Address></AddressValidateRequest>`;

    const uspsUrl = `https://secure.shippingapis.com/ShippingAPI.dll?API=Verify&XML=${encodeURIComponent(xml)}`;

    const response = await fetch(uspsUrl);
    const responseText = await response.text();

    // Check for address-level errors (e.g., "Address Not Found")
    const descriptionMatch = responseText.match(/<Description>(.*?)<\/Description>/);
    if (responseText.includes('<Error>') && descriptionMatch) {
      return NextResponse.json({ error: `USPS: ${descriptionMatch[1]}` });
    }

    // Extract verified address fields
    const getField = (field: string): string => {
      const match = responseText.match(new RegExp(`<${field}>(.*?)</${field}>`));
      return match ? match[1] : '';
    };

    const verifiedAddress = getField('Address2'); // Street address
    const verifiedCity = getField('City');
    const verifiedState = getField('State');
    const verifiedZip5 = getField('Zip5');
    const verifiedZip4 = getField('Zip4');
    const returnText = getField('ReturnText'); // USPS warning if any

    const zip5plus4 = verifiedZip4
      ? `${verifiedZip5}-${verifiedZip4}`
      : verifiedZip5;

    return NextResponse.json({
      address: verifiedAddress,
      city: verifiedCity,
      state: verifiedState,
      zip5: verifiedZip5,
      zip4: verifiedZip4,
      zip5plus4,
      warning: returnText || null,
      verified: true,
    });
  } catch (error) {
    console.error('USPS verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify address' },
      { status: 500 }
    );
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
