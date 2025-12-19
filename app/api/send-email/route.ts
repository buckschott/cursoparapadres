import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, email, telefono, clase, mensaje } = body;

    const { data, error } = await resend.emails.send({
      from: 'Atención al Cliente <atencionalcliente@cursoparapadres.org>',
      to: ['info@cursoparapadres.org'],
      subject: 'New Order - Spanish Site (cursoparapadres.org)',
      html: `
        <h2>New Order from cursoparapadres.org (Spanish Site)</h2>
        <p><strong>Name:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${telefono || 'Not provided'}</p>
        <p><strong>Class Requested:</strong> ${clase}</p>
        <p><strong>Message:</strong> ${mensaje || 'None'}</p>
        <hr>
        <p><em>This form was submitted from cursoparapadres.org (Spanish site)</em></p>
      `,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}