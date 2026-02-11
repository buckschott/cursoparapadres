/**
 * Georgia State Data
 * 159 counties — county-by-county court requirements
 * SEO Content Expansion: February 2026
 */

import type { StateData } from './types';

export const georgiaStates: Record<string, StateData> = {
  'georgia': {
    slug: 'georgia',
    name: 'Georgia',
    nameEs: 'Georgia',
    countyCount: 159,
    additionalContent: 'Georgia tiene una comunidad hispana grande y diversa, especialmente en Atlanta, Dalton, Gainesville, y las áreas agrícolas del sur del estado. Los tribunales de familia en los 159 condados reconocen nuestro nombre y aceptan nuestros certificados. El Original.',

    // === SEO Content Expansion ===

    metaDescription: 'Clase para padres en Georgia — curso online en español. Aceptada en Fulton, Gwinnett, DeKalb, Cobb, y los 159 condados. Certificado instantáneo. Putting Kids First® — El Original.',

    introContent: `En Georgia, la mayoría de los condados requieren una clase para padres antes de que el tribunal emita una orden final en casos de divorcio, custodia, legitimación, paternidad, o modificación de una orden existente. La Regla 24.8 del Tribunal Superior de Georgia autoriza a cada condado a establecer este requisito — y casi todos lo hacen. Si el tribunal le dijo que necesita completar una clase para padres, nuestra clase en línea cumple con ese requisito. En español. Desde cualquier dispositivo. Certificado listo en el momento que termine.

Putting Kids First® es el nombre más reconocido en educación parental — líderes desde hace décadas. Miles de padres en Atlanta, Savannah, Augusta, Dalton, Gainesville, y los 159 condados de Georgia ya han presentado nuestro certificado exitosamente. El Original. El Certificado Más Aceptado.`,

    courtContext: 'En Georgia, cada condado establece sus propios requisitos para la clase de educación parental. En condados como Fulton, DeKalb, Gwinnett, y Cobb, la clase es obligatoria en prácticamente todos los casos de familia con hijos menores. Nuestro certificado es aceptado en los 159 condados, ya sea que necesite una clase de coparentalidad o una clase de crianza.',

    faqs: [
      {
        question: '¿Qué clase necesito tomar?',
        answer: `Depende de su situación:

Si su caso es por divorcio, custodia, legitimación, separación, o modificación de una orden existente → necesita la Clase de Coparentalidad. Es la clase que la gran mayoría de los tribunales en Georgia piden.

Si le pidieron una clase de habilidades para padres, o fue referido por un juez, DFCS, un terapeuta, o la escuela de sus hijos → necesita la Clase de Crianza.

Si tiene sus papeles del tribunal en inglés y dicen "parenting seminar," "parenting class," o "parent education class," necesita la Clase de Coparentalidad. Es la que la gran mayoría de los padres en Georgia necesitan.`
      },
      {
        question: 'Mi caso es de legitimación. ¿Necesito tomar una clase para padres?',
        answer: `En la mayoría de los condados de Georgia, sí. La clase de educación parental se requiere en casos de legitimación — el proceso legal donde un padre no casado establece sus derechos legales sobre su hijo. El requisito es el mismo que en un caso de divorcio o custodia.

Nuestra clase cumple con este requisito. 4 horas, en español, con certificado instantáneo.`
      },
      {
        question: '¿Cuánto tiempo tengo para completar la clase?',
        answer: `En Georgia, el plazo depende de su condado. Muchos condados — incluyendo Fulton, DeKalb, Gwinnett, y Cobb — requieren que complete la clase dentro de 30 días de recibir la orden judicial. En todos los casos, debe completarla antes de la audiencia final.

Nuestra clase es de 4 horas y puede completarla en una sesión o en varios días. Revise sus papeles del tribunal para confirmar su plazo, y no espere hasta el último momento.`
      },
      {
        question: '¿Puedo tomar la clase en español aunque mis papeles del tribunal estén en inglés?',
        answer: `Sí. En Georgia, los tribunales pueden proporcionar intérpretes durante las audiencias, pero todos los documentos legales deben presentarse en inglés. Nuestra clase es 100% en español para que entienda cada lección completamente. Su certificado se emite en inglés — listo para entregar en la oficina del secretario de su condado sin necesidad de traducción.`
      },
      {
        question: '¿Esta clase para padres es aceptada en mi condado?',
        answer: `Sí. Nuestro certificado es aceptado en los 159 condados de Georgia, incluyendo Fulton, DeKalb, Gwinnett, Cobb, Clayton, Cherokee, Forsyth, y todos los demás.

Putting Kids First® es el nombre más reconocido en educación parental — líderes desde hace décadas. El Original. El Certificado Más Aceptado.`
      },
      {
        question: '¿Qué pasa si no completo la clase antes de mi audiencia?',
        answer: `El tribunal puede retrasar su caso hasta que usted complete la clase. En Georgia, un juez no puede emitir una orden final en su caso de divorcio, custodia, o legitimación hasta que ambos padres presenten su certificado. Eso significa más tiempo, más estrés, y posiblemente más costos.

No arriesgue su caso. Nuestra clase es de 4 horas y puede completarla desde su teléfono hoy mismo.`
      },
      {
        question: '¿Cuándo recibo mi certificado y cómo se lo entrego al tribunal?',
        answer: `Su certificado se genera instantáneamente al completar la clase. Es un PDF que puede descargar, imprimir, o enviar por correo electrónico. Cada certificado incluye un código QR y un código de verificación único para que el tribunal confirme su autenticidad en segundos.

Lleve una copia impresa a la oficina del secretario del tribunal en el condado donde se presentó su caso. Muchos condados en Georgia también aceptan que envíe el certificado por correo electrónico. Si tiene abogado, envíeselo para que lo incluya en su expediente.`
      },
      {
        question: '¿Ambos padres tienen que tomar la clase?',
        answer: `En la mayoría de los condados de Georgia, sí — ambos padres deben completar la clase por separado antes de la audiencia final. Esto aplica en casos de divorcio, custodia, legitimación, y modificaciones.

Cada padre se inscribe con su propia cuenta y recibe su propio certificado. No necesitan coordinar horarios ni asistir juntos.`
      }
    ],

    counties: [
      { name: 'Appling', city: 'Baxley' },
      { name: 'Atkinson', city: 'Pearson' },
      { name: 'Bacon', city: 'Alma' },
      { name: 'Baker', city: 'Newton' },
      { name: 'Baldwin', city: 'Milledgeville' },
      { name: 'Banks', city: 'Homer' },
      { name: 'Barrow', city: 'Winder' },
      { name: 'Bartow', city: 'Cartersville' },
      { name: 'Ben Hill', city: 'Fitzgerald' },
      { name: 'Berrien', city: 'Nashville' },
      { name: 'Bibb', city: 'Macon' },
      { name: 'Bleckley', city: 'Cochran' },
      { name: 'Brantley', city: 'Nahunta' },
      { name: 'Brooks', city: 'Quitman' },
      { name: 'Bryan', city: 'Pembroke' },
      { name: 'Bulloch', city: 'Statesboro' },
      { name: 'Burke', city: 'Waynesboro' },
      { name: 'Butts', city: 'Jackson' },
      { name: 'Calhoun', city: 'Morgan' },
      { name: 'Camden', city: 'Woodbine' },
      { name: 'Candler', city: 'Metter' },
      { name: 'Carroll', city: 'Carrollton' },
      { name: 'Catoosa', city: 'Ringgold' },
      { name: 'Charlton', city: 'Folkston' },
      { name: 'Chatham', city: 'Savannah' },
      { name: 'Chattahoochee', city: 'Cusseta' },
      { name: 'Chattooga', city: 'Summerville' },
      { name: 'Cherokee', city: 'Canton' },
      { name: 'Clarke', city: 'Athens' },
      { name: 'Clay', city: 'Fort Gaines' },
      { name: 'Clayton', city: 'Jonesboro' },
      { name: 'Clinch', city: 'Homerville' },
      { name: 'Cobb', city: 'Marietta' },
      { name: 'Coffee', city: 'Douglas' },
      { name: 'Colquitt', city: 'Moultrie' },
      { name: 'Columbia', city: 'Evans' },
      { name: 'Cook', city: 'Adel' },
      { name: 'Coweta', city: 'Newnan' },
      { name: 'Crawford', city: 'Knoxville' },
      { name: 'Crisp', city: 'Cordele' },
      { name: 'Dade', city: 'Trenton' },
      { name: 'Dawson', city: 'Dawsonville' },
      { name: 'Decatur', city: 'Bainbridge' },
      { name: 'DeKalb', city: 'Decatur' },
      { name: 'Dodge', city: 'Eastman' },
      { name: 'Dooly', city: 'Vienna' },
      { name: 'Dougherty', city: 'Albany' },
      { name: 'Douglas', city: 'Douglasville' },
      { name: 'Early', city: 'Blakely' },
      { name: 'Echols', city: 'Statenville' },
      { name: 'Effingham', city: 'Springfield' },
      { name: 'Elbert', city: 'Elberton' },
      { name: 'Emanuel', city: 'Swainsboro' },
      { name: 'Evans', city: 'Claxton' },
      { name: 'Fannin', city: 'Blue Ridge' },
      { name: 'Fayette', city: 'Fayetteville' },
      { name: 'Floyd', city: 'Rome' },
      { name: 'Forsyth', city: 'Cumming' },
      { name: 'Franklin', city: 'Carnesville' },
      { name: 'Fulton', city: 'Atlanta' },
      { name: 'Gilmer', city: 'Ellijay' },
      { name: 'Glascock', city: 'Gibson' },
      { name: 'Glynn', city: 'Brunswick' },
      { name: 'Gordon', city: 'Calhoun' },
      { name: 'Grady', city: 'Cairo' },
      { name: 'Greene', city: 'Greensboro' },
      { name: 'Gwinnett', city: 'Lawrenceville' },
      { name: 'Habersham', city: 'Clarkesville' },
      { name: 'Hall', city: 'Gainesville' },
      { name: 'Hancock', city: 'Sparta' },
      { name: 'Haralson', city: 'Buchanan' },
      { name: 'Harris', city: 'Hamilton' },
      { name: 'Hart', city: 'Hartwell' },
      { name: 'Heard', city: 'Franklin' },
      { name: 'Henry', city: 'McDonough' },
      { name: 'Houston', city: 'Perry' },
      { name: 'Irwin', city: 'Ocilla' },
      { name: 'Jackson', city: 'Jefferson' },
      { name: 'Jasper', city: 'Monticello' },
      { name: 'Jeff Davis', city: 'Hazlehurst' },
      { name: 'Jefferson', city: 'Louisville' },
      { name: 'Jenkins', city: 'Millen' },
      { name: 'Johnson', city: 'Wrightsville' },
      { name: 'Jones', city: 'Gray' },
      { name: 'Lamar', city: 'Barnesville' },
      { name: 'Lanier', city: 'Lakeland' },
      { name: 'Laurens', city: 'Dublin' },
      { name: 'Lee', city: 'Leesburg' },
      { name: 'Liberty', city: 'Hinesville' },
      { name: 'Lincoln', city: 'Lincolnton' },
      { name: 'Long', city: 'Ludowici' },
      { name: 'Lowndes', city: 'Valdosta' },
      { name: 'Lumpkin', city: 'Dahlonega' },
      { name: 'Macon', city: 'Oglethorpe' },
      { name: 'Madison', city: 'Danielsville' },
      { name: 'Marion', city: 'Buena Vista' },
      { name: 'McDuffie', city: 'Thomson' },
      { name: 'McIntosh', city: 'Darien' },
      { name: 'Meriwether', city: 'Greenville' },
      { name: 'Miller', city: 'Colquitt' },
      { name: 'Mitchell', city: 'Camilla' },
      { name: 'Monroe', city: 'Forsyth' },
      { name: 'Montgomery', city: 'Mount Vernon' },
      { name: 'Morgan', city: 'Madison' },
      { name: 'Murray', city: 'Chatsworth' },
      { name: 'Muscogee', city: 'Columbus' },
      { name: 'Newton', city: 'Covington' },
      { name: 'Oconee', city: 'Watkinsville' },
      { name: 'Oglethorpe', city: 'Lexington' },
      { name: 'Paulding', city: 'Dallas' },
      { name: 'Peach', city: 'Fort Valley' },
      { name: 'Pickens', city: 'Jasper' },
      { name: 'Pierce', city: 'Blackshear' },
      { name: 'Pike', city: 'Zebulon' },
      { name: 'Polk', city: 'Cedartown' },
      { name: 'Pulaski', city: 'Hawkinsville' },
      { name: 'Putnam', city: 'Eatonton' },
      { name: 'Quitman', city: 'Georgetown' },
      { name: 'Rabun', city: 'Clayton' },
      { name: 'Randolph', city: 'Cuthbert' },
      { name: 'Richmond', city: 'Augusta' },
      { name: 'Rockdale', city: 'Conyers' },
      { name: 'Schley', city: 'Ellaville' },
      { name: 'Screven', city: 'Sylvania' },
      { name: 'Seminole', city: 'Donalsonville' },
      { name: 'Spalding', city: 'Griffin' },
      { name: 'Stephens', city: 'Toccoa' },
      { name: 'Stewart', city: 'Lumpkin' },
      { name: 'Sumter', city: 'Americus' },
      { name: 'Talbot', city: 'Talbotton' },
      { name: 'Taliaferro', city: 'Crawfordville' },
      { name: 'Tattnall', city: 'Reidsville' },
      { name: 'Taylor', city: 'Butler' },
      { name: 'Telfair', city: 'McRae-Helena' },
      { name: 'Terrell', city: 'Dawson' },
      { name: 'Thomas', city: 'Thomasville' },
      { name: 'Tift', city: 'Tifton' },
      { name: 'Toombs', city: 'Lyons' },
      { name: 'Towns', city: 'Hiawassee' },
      { name: 'Treutlen', city: 'Soperton' },
      { name: 'Troup', city: 'LaGrange' },
      { name: 'Turner', city: 'Ashburn' },
      { name: 'Twiggs', city: 'Jeffersonville' },
      { name: 'Union', city: 'Blairsville' },
      { name: 'Upson', city: 'Thomaston' },
      { name: 'Walker', city: 'LaFayette' },
      { name: 'Walton', city: 'Monroe' },
      { name: 'Ware', city: 'Waycross' },
      { name: 'Warren', city: 'Warrenton' },
      { name: 'Washington', city: 'Sandersville' },
      { name: 'Wayne', city: 'Jesup' },
      { name: 'Webster', city: 'Preston' },
      { name: 'Wheeler', city: 'Alamo' },
      { name: 'White', city: 'Cleveland' },
      { name: 'Whitfield', city: 'Dalton' },
      { name: 'Wilcox', city: 'Abbeville' },
      { name: 'Wilkes', city: 'Washington' },
      { name: 'Wilkinson', city: 'Irwinton' },
      { name: 'Worth', city: 'Sylvester' },
    ],
  },
};
