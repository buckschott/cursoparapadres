import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import Anthropic from '@anthropic-ai/sdk';

// Admin emails that can access this endpoint
const ADMIN_EMAILS = ['jonescraig@me.com'];

export async function POST(request: NextRequest) {
  // Initialize Anthropic client inside handler (env vars available at runtime)
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY not found in environment');
    return NextResponse.json({ error: 'Translation service not configured' }, { status: 500 });
  }

  const anthropic = new Anthropic({ apiKey });
  const supabase = createServerClient();

  try {
    // Get admin user from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    let adminEmail: string | null = null;

    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      adminEmail = user?.email || null;
    }

    if (!adminEmail || !ADMIN_EMAILS.includes(adminEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, text, template, customerName } = await request.json();

    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 });
    }

    // ========================================================================
    // TRANSLATE INCOMING EMAIL (Spanish → English)
    // ========================================================================
    if (action === 'translate_incoming') {
      if (!text) {
        return NextResponse.json({ error: 'Missing text' }, { status: 400 });
      }

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `You are a translator for a customer service team. Translate this Spanish customer email to English. Also extract any email addresses mentioned.

Return your response in this exact JSON format:
{
  "translation": "the English translation",
  "detectedEmail": "email@example.com or null if none found",
  "detectedTopic": "one of: password, access, certificate, refund, exam, general",
  "summary": "one sentence summary of what they need"
}

Spanish email to translate:
${text}`
          }
        ],
      });

      // Parse the response
      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      
      try {
        // Try to extract JSON from response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return NextResponse.json(parsed);
        }
      } catch {
        // If parsing fails, return raw translation
      }

      return NextResponse.json({
        translation: responseText,
        detectedEmail: null,
        detectedTopic: 'general',
        summary: 'Could not parse response',
      });
    }

    // ========================================================================
    // TRANSLATE OUTGOING RESPONSE (English → Spanish)
    // ========================================================================
    if (action === 'translate_outgoing') {
      if (!text) {
        return NextResponse.json({ error: 'Missing text' }, { status: 400 });
      }

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `You are a translator for a Spanish-language parenting class company called "Clase para Padres". Translate this English customer service response to Spanish.

Use a warm, professional tone. Use "usted" (formal you). 

End with:
— El equipo de Clase para Padres

English response to translate:
${text}`
          }
        ],
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      
      return NextResponse.json({
        translation: responseText,
      });
    }

    // ========================================================================
    // GET TEMPLATE RESPONSE (Pre-written Spanish templates)
    // ========================================================================
    if (action === 'get_template') {
      if (!template) {
        return NextResponse.json({ error: 'Missing template' }, { status: 400 });
      }

      const name = customerName || '';
      const greeting = name ? `Hola ${name},` : 'Hola,';

      const templates: Record<string, { subject: string; body: string }> = {
        password: {
          subject: 'Restablecer su contraseña - Clase para Padres',
          body: `${greeting}

Gracias por contactarnos. Para restablecer su contraseña:

1. Visite: https://claseparapadres.com/recuperar-contrasena
2. Ingrese su correo electrónico
3. Revise su bandeja de entrada (y carpeta de spam)
4. Haga clic en el enlace del correo
5. Cree una nueva contraseña

El enlace es válido por 1 hora. Si tiene algún problema, responda a este correo.

— El equipo de Clase para Padres`,
        },

        access: {
          subject: 'Acceso a su clase - Clase para Padres',
          body: `${greeting}

Gracias por contactarnos. Ya activé su acceso a la clase.

Para ingresar:
1. Visite: https://claseparapadres.com/iniciar-sesion
2. Use su correo electrónico y contraseña
3. Haga clic en "Ir a Mi Clase"

Si no recuerda su contraseña, puede restablecerla aquí:
https://claseparapadres.com/recuperar-contrasena

¿Tiene alguna otra pregunta? Estamos aquí para ayudarle.

— El equipo de Clase para Padres`,
        },

        certificate: {
          subject: 'Su certificado - Clase para Padres',
          body: `${greeting}

Gracias por contactarnos sobre su certificado.

Para descargar su certificado:
1. Inicie sesión en: https://claseparapadres.com/iniciar-sesion
2. Vaya a "Mi Panel"
3. Haga clic en "Ver Certificado"
4. Haga clic en "Descargar PDF"

Si necesita que reenviemos el certificado a su abogado, responda con el nombre y correo electrónico de su abogado.

— El equipo de Clase para Padres`,
        },

        certificate_resend: {
          subject: 'Su certificado (reenviado) - Clase para Padres',
          body: `${greeting}

Le reenvío su certificado de completación. Está adjunto a este correo.

También puede descargarlo en cualquier momento desde su cuenta:
https://claseparapadres.com/iniciar-sesion

Si su abogado necesita una copia, con gusto se la enviamos. Solo responda con el nombre y correo de su abogado.

— El equipo de Clase para Padres`,
        },

        refund: {
          subject: 'Reembolso procesado - Clase para Padres',
          body: `${greeting}

Su reembolso ha sido procesado exitosamente.

Detalles:
- El reembolso aparecerá en su estado de cuenta en 5-10 días hábiles
- El tiempo exacto depende de su banco

Si tiene alguna pregunta, no dude en responder a este correo.

— El equipo de Clase para Padres`,
        },

        exam: {
          subject: 'Ayuda con el examen - Clase para Padres',
          body: `${greeting}

Gracias por contactarnos sobre el examen.

Información importante:
- El examen tiene 20 preguntas
- Necesita 70% (14 respuestas correctas) para aprobar
- Puede tomar el examen las veces que necesite
- Las respuestas están en las lecciones

Consejos:
1. Revise las lecciones antes del examen
2. Tome su tiempo — no hay límite
3. Si no aprueba, el sistema le dirá qué lecciones repasar

¿Tiene alguna pregunta específica? Estamos aquí para ayudarle.

— El equipo de Clase para Padres`,
        },

        general: {
          subject: 'Re: Su consulta - Clase para Padres',
          body: `${greeting}

Gracias por contactarnos. Recibimos su mensaje y estamos aquí para ayudarle.



Si tiene alguna otra pregunta, no dude en responder a este correo.

— El equipo de Clase para Padres`,
        },

        payment_issue: {
          subject: 'Problema con su pago - Clase para Padres',
          body: `${greeting}

Gracias por contactarnos. Revisé su cuenta y veo el problema con su pago.

Ya lo solucioné — su acceso está activo ahora.

Para ingresar a su clase:
1. Visite: https://claseparapadres.com/iniciar-sesion
2. Use su correo electrónico
3. Si no recuerda su contraseña: https://claseparapadres.com/recuperar-contrasena

Disculpe las molestias. ¿Hay algo más en que pueda ayudarle?

— El equipo de Clase para Padres`,
        },

        attorney_copy: {
          subject: 'Copia para su abogado - Clase para Padres',
          body: `${greeting}

Con gusto enviaremos una copia de su certificado a su abogado.

Por favor responda con:
1. Nombre completo del abogado
2. Correo electrónico del abogado

Una vez que tengamos esta información, enviaremos el certificado directamente.

— El equipo de Clase para Padres`,
        },
      };

      const selectedTemplate = templates[template];
      
      if (!selectedTemplate) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }

      return NextResponse.json(selectedTemplate);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
