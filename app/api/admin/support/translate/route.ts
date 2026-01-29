import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { isAdmin } from '@/lib/admin';

// Call Anthropic API directly via fetch
async function callClaude(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 500,
      messages: [
        { role: 'user', content: prompt }
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Anthropic API error:', response.status, error);
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
}

export async function POST(request: NextRequest) {
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

    if (!adminEmail || !isAdmin(adminEmail)) {
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

      const prompt = `You are a translator for a customer service team. Translate this Spanish customer email to English. Also extract any email addresses mentioned.

Return your response in this exact JSON format:
{
  "translation": "the English translation",
  "detectedEmail": "email@example.com or null if none found",
  "detectedTopic": "one of: password, access, certificate, refund, exam, tech_support, deadline, duplicate_account, class_swap, general",
  "summary": "one sentence summary of what they need"
}

Spanish email to translate:
${text}`;

      const responseText = await callClaude(prompt);
      
      try {
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

      const prompt = `You are a translator for a Spanish-language parenting class company called "Clase para Padres". Translate this English customer service response to Spanish.

Use a warm, professional tone. Use "usted" (formal you). 

End with:
— El equipo de Clase para Padres

English response to translate:
${text}`;

      const responseText = await callClaude(prompt);
      
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
        // ====================================================================
        // PASSWORD RESET
        // ====================================================================
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

        // ====================================================================
        // COURSE ACCESS
        // ====================================================================
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

        // ====================================================================
        // CERTIFICATE HELP
        // ====================================================================
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

        // ====================================================================
        // CERTIFICATE RESEND
        // ====================================================================
        certificate_resend: {
          subject: 'Su certificado (reenviado) - Clase para Padres',
          body: `${greeting}

Le reenvío su certificado de completación. Está adjunto a este correo.

También puede descargarlo en cualquier momento desde su cuenta:
https://claseparapadres.com/iniciar-sesion

Si su abogado necesita una copia, con gusto se la enviamos. Solo responda con el nombre y correo de su abogado.

— El equipo de Clase para Padres`,
        },

        // ====================================================================
        // REFUND CONFIRMATION
        // ====================================================================
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

        // ====================================================================
        // EXAM HELP
        // ====================================================================
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

        // ====================================================================
        // GENERAL RESPONSE
        // ====================================================================
        general: {
          subject: 'Re: Su consulta - Clase para Padres',
          body: `${greeting}

Gracias por contactarnos. Recibimos su mensaje y estamos aquí para ayudarle.



Si tiene alguna otra pregunta, no dude en responder a este correo.

— El equipo de Clase para Padres`,
        },

        // ====================================================================
        // PAYMENT ISSUE
        // ====================================================================
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

        // ====================================================================
        // ATTORNEY COPY REQUEST
        // ====================================================================
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

        // ====================================================================
        // TECHNICAL SUPPORT (NEW)
        // ====================================================================
        tech_support: {
          subject: 'Soporte técnico - Clase para Padres',
          body: `${greeting}

Gracias por contactarnos. Entiendo que está teniendo problemas técnicos.

Por favor intente estos pasos:

1. Cierre completamente su navegador y vuelva a abrirlo
2. Borre la caché de su navegador (Ctrl+Shift+Delete en Windows, Cmd+Shift+Delete en Mac)
3. Intente usar otro navegador (Chrome, Firefox, Safari, o Edge)
4. Si está en su teléfono, intente desde una computadora

Si el problema continúa después de estos pasos, por favor responda con:
- ¿Qué dispositivo usa? (teléfono, tableta, computadora)
- ¿Qué navegador usa? (Chrome, Safari, etc.)
- ¿Qué mensaje de error ve? (si hay alguno)

Estamos aquí para ayudarle a resolver esto.

— El equipo de Clase para Padres`,
        },

        // ====================================================================
        // DEADLINE QUESTION (NEW)
        // ====================================================================
        deadline: {
          subject: 'Su fecha límite - Clase para Padres',
          body: `${greeting}

Gracias por contactarnos sobre su fecha límite.

Buenas noticias:
- Nuestra clase es 100% en línea
- Puede completarla a su propio ritmo
- La mayoría de las personas la terminan en 4-6 horas
- Puede pausar y continuar cuando quiera

Para terminar antes de su fecha límite:
1. Inicie sesión: https://claseparapadres.com/iniciar-sesion
2. Complete las 15 lecciones
3. Apruebe el examen final (70% para aprobar)
4. Descargue su certificado inmediatamente

El certificado está disponible al instante después de aprobar el examen.

¿Necesita ayuda adicional? Estamos aquí para apoyarle.

— El equipo de Clase para Padres`,
        },

        // ====================================================================
        // DUPLICATE ACCOUNT (NEW)
        // ====================================================================
        duplicate_account: {
          subject: 'Su cuenta - Clase para Padres',
          body: `${greeting}

Gracias por contactarnos. Veo que tiene más de una cuenta en nuestro sistema.

Ya combiné sus cuentas. Ahora puede usar:
- Correo electrónico: [INSERTAR CORREO]
- Para ingresar: https://claseparapadres.com/iniciar-sesion

Si no recuerda su contraseña, puede restablecerla aquí:
https://claseparapadres.com/recuperar-contrasena

Todo su progreso ha sido preservado. ¿Tiene alguna otra pregunta?

— El equipo de Clase para Padres`,
        },

        // ====================================================================
        // CLASS SWAP (NEW)
        // ====================================================================
        class_swap: {
          subject: 'Cambio de clase - Clase para Padres',
          body: `${greeting}

Gracias por contactarnos sobre cambiar su clase.

Ofrecemos dos clases:
1. **Clase de Coparentalidad** — Para padres que comparten la crianza después de una separación o divorcio
2. **Clase de Crianza** — Para mejorar habilidades generales de crianza

He cambiado su inscripción a la clase que necesita. Su progreso anterior ha sido reiniciado para que pueda comenzar la nueva clase.

Para comenzar:
1. Inicie sesión: https://claseparapadres.com/iniciar-sesion
2. Verá su nueva clase en "Mi Panel"

Si tiene alguna pregunta sobre cuál clase es la correcta para su situación, no dude en preguntarnos.

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
