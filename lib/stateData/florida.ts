/**
 * Florida State Data
 * 67 counties — mandatory by law (§ 61.21), 45-day deadline
 * SEO Content Expansion: February 2026 (polished)
 */

import type { StateData } from './types';

export const floridaStates: Record<string, StateData> = {
  'florida': {
    slug: 'florida',
    name: 'Florida',
    nameEs: 'Florida',
    countyCount: 67,
    additionalContent: 'Florida tiene una de las poblaciones hispanas más grandes del país, especialmente en Miami, Orlando, Tampa, y Jacksonville. Los tribunales de familia en los 67 condados reconocen nuestro nombre y aceptan nuestros certificados. El Original.',

    // === SEO Content Expansion ===

    metaDescription: 'Clase para padres obligatoria en Florida — curso online en español. Cumpla el requisito de los 45 días. Certificado instantáneo al terminar. Putting Kids First® — El Original.',

    introContent: `En Florida, la clase para padres es obligatoria. Si usted está en un caso de divorcio con hijos menores o una acción de paternidad, la ley del estado requiere que complete esta clase antes de que el tribunal emita una orden final — no es opcional. Y el reloj ya está corriendo: tiene 45 días desde la fecha de presentación o notificación para completarla. Nuestra clase para padres en línea cumple con este requisito. Complétela en 4 horas, desde su teléfono, y reciba su certificado al instante.

El Estatuto de Florida § 61.21 establece que todos los padres en un proceso de disolución matrimonial con hijos menores deben completar una clase de educación parental. Putting Kids First® es el nombre más reconocido en educación parental — líderes desde hace décadas. Miles de padres en Miami, Orlando, Tampa, Jacksonville, y los 67 condados de Florida ya han presentado nuestro certificado exitosamente. El Original. El Certificado Más Aceptado.`,

    courtContext: 'Florida es uno de los pocos estados donde esta clase es obligatoria por ley — no depende del juez. Todos los padres en un divorcio con hijos menores y en acciones de paternidad deben completarla. Nuestro certificado es aceptado en los 67 condados, ya sea que necesite una clase de coparentalidad o una clase de crianza.',

    faqs: [
      {
        question: '¿Qué clase necesito tomar?',
        answer: `Depende de su situación:

Si su caso es por divorcio, custodia, o paternidad → necesita la Clase de Coparentalidad. En Florida, esta clase se conoce oficialmente como "Parent Education and Family Stabilization Course." Es la clase que la ley de Florida requiere.

Si le pidieron una clase de habilidades para padres, o fue referido por un juez, DCF, un terapeuta, o la escuela de sus hijos → necesita la Clase de Crianza.

Si tiene sus papeles del tribunal en inglés y dicen "parent education and family stabilization course" o "parenting class," necesita la Clase de Coparentalidad. Es la que la gran mayoría de los padres en Florida necesitan.`
      },
      {
        question: '¿Esta es la clase que aparece en mis papeles del tribunal como "Parent Education and Family Stabilization Course"?',
        answer: `Sí. Nuestra Clase de Coparentalidad cumple con los requisitos del Estatuto de Florida § 61.21 para la clase de educación parental y estabilización familiar. Es el mismo requisito, en español.

Nuestro certificado es aceptado en los 67 condados de Florida. Putting Kids First® — líderes en educación parental desde hace décadas. El Original. El Certificado Más Aceptado.`
      },
      {
        question: '¿Cuánto tiempo tengo para completar la clase?',
        answer: `Florida tiene plazos estrictos. Si usted presentó el caso (peticionario), tiene 45 días desde la fecha de presentación. Si le notificaron del caso (demandado), tiene 45 días desde la fecha de notificación. En acciones de paternidad, los plazos son similares.

Nuestra clase es de 4 horas y puede completarla en una sesión o en varios días. No espere — el tribunal no puede emitir una orden final hasta que ambos padres completen la clase.`
      },
      {
        question: '¿Puedo tomar la clase en español aunque mis papeles del tribunal estén en inglés?',
        answer: `Sí. Aunque el condado de Miami-Dade y otros condados de Florida ofrecen servicios bilingües, los documentos legales deben presentarse en inglés. Nuestra clase es 100% en español para que entienda cada lección completamente, pero su certificado se emite en inglés — listo para presentar al tribunal sin necesidad de traducción.`
      },
      {
        question: 'Mi caso es de paternidad, no de divorcio. ¿Todavía necesito la clase?',
        answer: `Sí. En Florida, la clase de educación parental es obligatoria tanto en divorcios con hijos menores como en acciones de paternidad que involucren responsabilidad parental. El requisito es el mismo — y nuestra clase cumple con él.

El plazo también es el mismo: 45 días. Nuestra clase es de 4 horas y puede completarla desde su teléfono.`
      },
      {
        question: '¿Qué pasa si no completo la clase dentro de los 45 días?',
        answer: `El tribunal puede tomar acción seria. En Florida, un juez puede declararlo en desacato, negarle tiempo compartido con sus hijos, o negarle responsabilidad parental compartida. Su caso no puede avanzar hasta que ambos padres completen la clase.

No arriesgue su caso ni la relación con sus hijos. Nuestra clase es de 4 horas y puede completarla hoy mismo.`
      },
      {
        question: '¿Cuándo recibo mi certificado y cómo se lo entrego al tribunal?',
        answer: `Su certificado se genera instantáneamente al completar la clase. Es un PDF que puede descargar, imprimir, o enviar por correo electrónico. Cada certificado incluye un código QR y un código de verificación único para que el tribunal confirme su autenticidad en segundos.

Lleve una copia impresa a la oficina del secretario del tribunal donde se presentó su caso, o entréguelo directamente al juez en su próxima audiencia. Si tiene abogado, envíeselo para que lo incluya en su expediente.`
      },
      {
        question: '¿Ambos padres tienen que tomar la clase?',
        answer: `Sí. En Florida, la ley requiere que ambos padres completen la clase por separado. No es opcional para ninguno de los dos — el tribunal no puede emitir una orden final hasta que ambos presenten su certificado.

Cada padre se inscribe con su propia cuenta y recibe su propio certificado. No necesitan coordinar horarios.`
      }
    ],

    counties: [
      { name: 'Alachua', city: 'Gainesville' },
      { name: 'Baker', city: 'Macclenny' },
      { name: 'Bay', city: 'Panama City' },
      { name: 'Bradford', city: 'Starke' },
      { name: 'Brevard', city: 'Titusville' },
      { name: 'Broward', city: 'Fort Lauderdale' },
      { name: 'Calhoun', city: 'Blountstown' },
      { name: 'Charlotte', city: 'Punta Gorda' },
      { name: 'Citrus', city: 'Inverness' },
      { name: 'Clay', city: 'Green Cove Springs' },
      { name: 'Collier', city: 'Naples' },
      { name: 'Columbia', city: 'Lake City' },
      { name: 'DeSoto', city: 'Arcadia' },
      { name: 'Dixie', city: 'Cross City' },
      { name: 'Duval', city: 'Jacksonville' },
      { name: 'Escambia', city: 'Pensacola' },
      { name: 'Flagler', city: 'Bunnell' },
      { name: 'Franklin', city: 'Apalachicola' },
      { name: 'Gadsden', city: 'Quincy' },
      { name: 'Gilchrist', city: 'Trenton' },
      { name: 'Glades', city: 'Moore Haven' },
      { name: 'Gulf', city: 'Port St. Joe' },
      { name: 'Hamilton', city: 'Jasper' },
      { name: 'Hardee', city: 'Wauchula' },
      { name: 'Hendry', city: 'LaBelle' },
      { name: 'Hernando', city: 'Brooksville' },
      { name: 'Highlands', city: 'Sebring' },
      { name: 'Hillsborough', city: 'Tampa' },
      { name: 'Holmes', city: 'Bonifay' },
      { name: 'Indian River', city: 'Vero Beach' },
      { name: 'Jackson', city: 'Marianna' },
      { name: 'Jefferson', city: 'Monticello' },
      { name: 'Lafayette', city: 'Mayo' },
      { name: 'Lake', city: 'Tavares' },
      { name: 'Lee', city: 'Fort Myers' },
      { name: 'Leon', city: 'Tallahassee' },
      { name: 'Levy', city: 'Bronson' },
      { name: 'Liberty', city: 'Bristol' },
      { name: 'Madison', city: 'Madison' },
      { name: 'Manatee', city: 'Bradenton' },
      { name: 'Marion', city: 'Ocala' },
      { name: 'Martin', city: 'Stuart' },
      { name: 'Miami-Dade', city: 'Miami' },
      { name: 'Monroe', city: 'Key West' },
      { name: 'Nassau', city: 'Fernandina Beach' },
      { name: 'Okaloosa', city: 'Crestview' },
      { name: 'Okeechobee', city: 'Okeechobee' },
      { name: 'Orange', city: 'Orlando' },
      { name: 'Osceola', city: 'Kissimmee' },
      { name: 'Palm Beach', city: 'West Palm Beach' },
      { name: 'Pasco', city: 'Dade City' },
      { name: 'Pinellas', city: 'Clearwater' },
      { name: 'Polk', city: 'Bartow' },
      { name: 'Putnam', city: 'Palatka' },
      { name: 'Santa Rosa', city: 'Milton' },
      { name: 'Sarasota', city: 'Sarasota' },
      { name: 'Seminole', city: 'Sanford' },
      { name: 'St. Johns', city: 'St. Augustine' },
      { name: 'St. Lucie', city: 'Fort Pierce' },
      { name: 'Sumter', city: 'Bushnell' },
      { name: 'Suwannee', city: 'Live Oak' },
      { name: 'Taylor', city: 'Perry' },
      { name: 'Union', city: 'Lake Butler' },
      { name: 'Volusia', city: 'DeLand' },
      { name: 'Wakulla', city: 'Crawfordville' },
      { name: 'Walton', city: 'DeFuniak Springs' },
      { name: 'Washington', city: 'Chipley' },
    ],
  },
};
