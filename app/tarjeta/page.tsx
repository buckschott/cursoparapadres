import { redirect } from 'next/navigation';

/**
 * Business card QR code redirect.
 * 
 * QR code and printed URL point here: claseparapadres.com/tarjeta
 * This redirects to homepage with tracking params.
 * 
 * Benefits:
 * - Short, typeable URL if QR fails
 * - Can update tracking/destination without reprinting cards
 * - All business card traffic flows through one path
 */
export default function TarjetaRedirect() {
  redirect('/?utm_source=bizcard&utm_medium=print');
}