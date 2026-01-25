/**
 * Northeast Region
 * States: Connecticut, Massachusetts, Maine, New Hampshire, New Jersey, New York, Pennsylvania, Rhode Island, Vermont
 * 9 states, ~200 counties
 */

import type { StateData } from './types';

export const northeastStates: Record<string, StateData> = {
  // ===========================================================================
  // CONNECTICUT
  // ===========================================================================
  'connecticut': {
    slug: 'connecticut',
    name: 'Connecticut',
    nameEs: 'Connecticut',
    countyCount: 8,
    additionalContent: 'Connecticut tiene una comunidad hispana vibrante, especialmente en Hartford, New Haven, Bridgeport, y Stamford. Los tribunales de familia en todo el estado reconocen nuestro nombre y aceptan nuestros certificados. El Original.',
    faqs: [
      {
        question: '¿Es aceptada en los tribunales de Connecticut?',
        answer: 'Sí. En los 8 condados. El Original. El Certificado Más Aceptado.',
      },
      {
        question: '¿Cuándo recibo mi certificado?',
        answer: 'Inmediatamente. Notificamos a su abogado automáticamente.',
      },
      {
        question: '¿Cuánto tiempo toma?',
        answer: '4 horas. A su ritmo.',
      },
      {
        question: '¿Puedo tomarla en mi teléfono?',
        answer: 'Sí. Teléfono, tableta o computadora.',
      },
    ],
    counties: [
      { name: 'Fairfield', city: 'Bridgeport' },
      { name: 'Hartford', city: 'Hartford' },
      { name: 'Litchfield', city: 'Litchfield' },
      { name: 'Middlesex', city: 'Middletown' },
      { name: 'New Haven', city: 'New Haven' },
      { name: 'New London', city: 'New London' },
      { name: 'Tolland', city: 'Rockville' },
      { name: 'Windham', city: 'Willimantic' },
    ],
  },

  // ===========================================================================
  // MAINE
  // ===========================================================================
  'maine': {
    slug: 'maine',
    name: 'Maine',
    nameEs: 'Maine',
    countyCount: 16,
    additionalContent: 'Maine tiene una comunidad hispana en crecimiento, especialmente en Portland y Lewiston. Los tribunales de familia en todo el estado reconocen nuestro nombre y aceptan nuestros certificados. El Original.',
    faqs: [
      {
        question: '¿Es aceptada en los tribunales de Maine?',
        answer: 'Sí. En los 16 condados. El Original. El Certificado Más Aceptado.',
      },
      {
        question: '¿Cuándo recibo mi certificado?',
        answer: 'Inmediatamente. Notificamos a su abogado automáticamente.',
      },
      {
        question: '¿Cuánto tiempo toma?',
        answer: '4 horas. A su ritmo.',
      },
      {
        question: '¿Puedo tomarla en mi teléfono?',
        answer: 'Sí. Teléfono, tableta o computadora.',
      },
    ],
    counties: [
      { name: 'Androscoggin', city: 'Auburn' },
      { name: 'Aroostook', city: 'Houlton' },
      { name: 'Cumberland', city: 'Portland' },
      { name: 'Franklin', city: 'Farmington' },
      { name: 'Hancock', city: 'Ellsworth' },
      { name: 'Kennebec', city: 'Augusta' },
      { name: 'Knox', city: 'Rockland' },
      { name: 'Lincoln', city: 'Wiscasset' },
      { name: 'Oxford', city: 'South Paris' },
      { name: 'Penobscot', city: 'Bangor' },
      { name: 'Piscataquis', city: 'Dover-Foxcroft' },
      { name: 'Sagadahoc', city: 'Bath' },
      { name: 'Somerset', city: 'Skowhegan' },
      { name: 'Waldo', city: 'Belfast' },
      { name: 'Washington', city: 'Machias' },
      { name: 'York', city: 'Alfred' },
    ],
  },

  // ===========================================================================
  // MASSACHUSETTS
  // ===========================================================================
  'massachusetts': {
    slug: 'massachusetts',
    name: 'Massachusetts',
    nameEs: 'Massachusetts',
    countyCount: 14,
    additionalContent: 'Massachusetts tiene una comunidad hispana grande y diversa, especialmente en Boston, Springfield, Worcester, y Lawrence. Los tribunales de familia en todo el estado reconocen nuestro nombre y aceptan nuestros certificados. El Original.',
    faqs: [
      {
        question: '¿Es aceptada en los tribunales de Massachusetts?',
        answer: 'Sí. En los 14 condados. El Original. El Certificado Más Aceptado.',
      },
      {
        question: '¿Cuándo recibo mi certificado?',
        answer: 'Inmediatamente. Notificamos a su abogado automáticamente.',
      },
      {
        question: '¿Cuánto tiempo toma?',
        answer: '4 horas. A su ritmo.',
      },
      {
        question: '¿Puedo tomarla en mi teléfono?',
        answer: 'Sí. Teléfono, tableta o computadora.',
      },
    ],
    counties: [
      { name: 'Barnstable', city: 'Barnstable' },
      { name: 'Berkshire', city: 'Pittsfield' },
      { name: 'Bristol', city: 'Taunton' },
      { name: 'Dukes', city: 'Edgartown' },
      { name: 'Essex', city: 'Salem' },
      { name: 'Franklin', city: 'Greenfield' },
      { name: 'Hampden', city: 'Springfield' },
      { name: 'Hampshire', city: 'Northampton' },
      { name: 'Middlesex', city: 'Cambridge' },
      { name: 'Nantucket', city: 'Nantucket' },
      { name: 'Norfolk', city: 'Dedham' },
      { name: 'Plymouth', city: 'Plymouth' },
      { name: 'Suffolk', city: 'Boston' },
      { name: 'Worcester', city: 'Worcester' },
    ],
  },

  // ===========================================================================
  // NEW HAMPSHIRE
  // ===========================================================================
  'new-hampshire': {
    slug: 'new-hampshire',
    name: 'New Hampshire',
    nameEs: 'Nuevo Hampshire',
    countyCount: 10,
    additionalContent: 'Nuevo Hampshire tiene una comunidad hispana en crecimiento, especialmente en Manchester y Nashua. Los tribunales de familia en todo el estado reconocen nuestro nombre y aceptan nuestros certificados. El Original.',
    faqs: [
      {
        question: '¿Es aceptada en los tribunales de Nuevo Hampshire?',
        answer: 'Sí. En los 10 condados. El Original. El Certificado Más Aceptado.',
      },
      {
        question: '¿Cuándo recibo mi certificado?',
        answer: 'Inmediatamente. Notificamos a su abogado automáticamente.',
      },
      {
        question: '¿Cuánto tiempo toma?',
        answer: '4 horas. A su ritmo.',
      },
      {
        question: '¿Puedo tomarla en mi teléfono?',
        answer: 'Sí. Teléfono, tableta o computadora.',
      },
    ],
    counties: [
      { name: 'Belknap', city: 'Laconia' },
      { name: 'Carroll', city: 'Ossipee' },
      { name: 'Cheshire', city: 'Keene' },
      { name: 'Coos', city: 'Lancaster' },
      { name: 'Grafton', city: 'Haverhill' },
      { name: 'Hillsborough', city: 'Nashua' },
      { name: 'Merrimack', city: 'Concord' },
      { name: 'Rockingham', city: 'Brentwood' },
      { name: 'Strafford', city: 'Dover' },
      { name: 'Sullivan', city: 'Newport' },
    ],
  },

  // ===========================================================================
  // NEW JERSEY
  // ===========================================================================
  'new-jersey': {
    slug: 'new-jersey',
    name: 'New Jersey',
    nameEs: 'Nueva Jersey',
    countyCount: 21,
    additionalContent: 'Nueva Jersey tiene una de las comunidades hispanas más grandes del noreste, especialmente en Newark, Jersey City, Paterson, y Elizabeth. Los tribunales de familia en los 21 condados reconocen nuestro nombre y aceptan nuestros certificados. El Original.',
    faqs: [
      {
        question: '¿Es aceptada en los tribunales de Nueva Jersey?',
        answer: 'Sí. En los 21 condados. El Original. El Certificado Más Aceptado.',
      },
      {
        question: '¿Cuándo recibo mi certificado?',
        answer: 'Inmediatamente. Notificamos a su abogado automáticamente.',
      },
      {
        question: '¿Cuánto tiempo toma?',
        answer: '4 horas. A su ritmo.',
      },
      {
        question: '¿Puedo tomarla en mi teléfono?',
        answer: 'Sí. Teléfono, tableta o computadora.',
      },
    ],
    counties: [
      { name: 'Atlantic', city: 'Mays Landing' },
      { name: 'Bergen', city: 'Hackensack' },
      { name: 'Burlington', city: 'Mount Holly' },
      { name: 'Camden', city: 'Camden' },
      { name: 'Cape May', city: 'Cape May Court House' },
      { name: 'Cumberland', city: 'Bridgeton' },
      { name: 'Essex', city: 'Newark' },
      { name: 'Gloucester', city: 'Woodbury' },
      { name: 'Hudson', city: 'Jersey City' },
      { name: 'Hunterdon', city: 'Flemington' },
      { name: 'Mercer', city: 'Trenton' },
      { name: 'Middlesex', city: 'New Brunswick' },
      { name: 'Monmouth', city: 'Freehold' },
      { name: 'Morris', city: 'Morristown' },
      { name: 'Ocean', city: 'Toms River' },
      { name: 'Passaic', city: 'Paterson' },
      { name: 'Salem', city: 'Salem' },
      { name: 'Somerset', city: 'Somerville' },
      { name: 'Sussex', city: 'Newton' },
      { name: 'Union', city: 'Elizabeth' },
      { name: 'Warren', city: 'Belvidere' },
    ],
  },

  // ===========================================================================
  // NEW YORK
  // ===========================================================================
  'new-york': {
    slug: 'new-york',
    name: 'New York',
    nameEs: 'Nueva York',
    countyCount: 62,
    additionalContent: 'Nueva York tiene una de las comunidades hispanas más grandes del país, especialmente en la ciudad de Nueva York, Long Island, y el Valle del Hudson. Los tribunales de familia en los 62 condados reconocen nuestro nombre y aceptan nuestros certificados. El Original.',
    faqs: [
      {
        question: '¿Es aceptada en los tribunales de Nueva York?',
        answer: 'Sí. En los 62 condados. El Original. El Certificado Más Aceptado.',
      },
      {
        question: '¿Cuándo recibo mi certificado?',
        answer: 'Inmediatamente. Notificamos a su abogado automáticamente.',
      },
      {
        question: '¿Cuánto tiempo toma?',
        answer: '4 horas. A su ritmo.',
      },
      {
        question: '¿Puedo tomarla en mi teléfono?',
        answer: 'Sí. Teléfono, tableta o computadora.',
      },
    ],
    counties: [
      { name: 'Albany', city: 'Albany' },
      { name: 'Allegany', city: 'Belmont' },
      { name: 'Bronx', city: 'Bronx' },
      { name: 'Broome', city: 'Binghamton' },
      { name: 'Cattaraugus', city: 'Little Valley' },
      { name: 'Cayuga', city: 'Auburn' },
      { name: 'Chautauqua', city: 'Mayville' },
      { name: 'Chemung', city: 'Elmira' },
      { name: 'Chenango', city: 'Norwich' },
      { name: 'Clinton', city: 'Plattsburgh' },
      { name: 'Columbia', city: 'Hudson' },
      { name: 'Cortland', city: 'Cortland' },
      { name: 'Delaware', city: 'Delhi' },
      { name: 'Dutchess', city: 'Poughkeepsie' },
      { name: 'Erie', city: 'Buffalo' },
      { name: 'Essex', city: 'Elizabethtown' },
      { name: 'Franklin', city: 'Malone' },
      { name: 'Fulton', city: 'Johnstown' },
      { name: 'Genesee', city: 'Batavia' },
      { name: 'Greene', city: 'Catskill' },
      { name: 'Hamilton', city: 'Lake Pleasant' },
      { name: 'Herkimer', city: 'Herkimer' },
      { name: 'Jefferson', city: 'Watertown' },
      { name: 'Kings', city: 'Brooklyn' },
      { name: 'Lewis', city: 'Lowville' },
      { name: 'Livingston', city: 'Geneseo' },
      { name: 'Madison', city: 'Wampsville' },
      { name: 'Monroe', city: 'Rochester' },
      { name: 'Montgomery', city: 'Fonda' },
      { name: 'Nassau', city: 'Mineola' },
      { name: 'New York', city: 'New York' },
      { name: 'Niagara', city: 'Lockport' },
      { name: 'Oneida', city: 'Utica' },
      { name: 'Onondaga', city: 'Syracuse' },
      { name: 'Ontario', city: 'Canandaigua' },
      { name: 'Orange', city: 'Goshen' },
      { name: 'Orleans', city: 'Albion' },
      { name: 'Oswego', city: 'Oswego' },
      { name: 'Otsego', city: 'Cooperstown' },
      { name: 'Putnam', city: 'Carmel' },
      { name: 'Queens', city: 'Jamaica' },
      { name: 'Rensselaer', city: 'Troy' },
      { name: 'Richmond', city: 'Staten Island' },
      { name: 'Rockland', city: 'New City' },
      { name: 'St. Lawrence', city: 'Canton' },
      { name: 'Saratoga', city: 'Ballston Spa' },
      { name: 'Schenectady', city: 'Schenectady' },
      { name: 'Schoharie', city: 'Schoharie' },
      { name: 'Schuyler', city: 'Watkins Glen' },
      { name: 'Seneca', city: 'Waterloo' },
      { name: 'Steuben', city: 'Bath' },
      { name: 'Suffolk', city: 'Riverhead' },
      { name: 'Sullivan', city: 'Monticello' },
      { name: 'Tioga', city: 'Owego' },
      { name: 'Tompkins', city: 'Ithaca' },
      { name: 'Ulster', city: 'Kingston' },
      { name: 'Warren', city: 'Lake George' },
      { name: 'Washington', city: 'Fort Edward' },
      { name: 'Wayne', city: 'Lyons' },
      { name: 'Westchester', city: 'White Plains' },
      { name: 'Wyoming', city: 'Warsaw' },
      { name: 'Yates', city: 'Penn Yan' },
    ],
  },

  // ===========================================================================
  // PENNSYLVANIA
  // ===========================================================================
  'pennsylvania': {
    slug: 'pennsylvania',
    name: 'Pennsylvania',
    nameEs: 'Pensilvania',
    countyCount: 67,
    additionalContent: 'Pensilvania tiene una comunidad hispana grande y diversa, especialmente en Philadelphia, Reading, Allentown, y Lancaster. Los tribunales de familia en los 67 condados reconocen nuestro nombre y aceptan nuestros certificados. El Original.',
    faqs: [
      {
        question: '¿Es aceptada en los tribunales de Pensilvania?',
        answer: 'Sí. En los 67 condados. El Original. El Certificado Más Aceptado.',
      },
      {
        question: '¿Cuándo recibo mi certificado?',
        answer: 'Inmediatamente. Notificamos a su abogado automáticamente.',
      },
      {
        question: '¿Cuánto tiempo toma?',
        answer: '4 horas. A su ritmo.',
      },
      {
        question: '¿Puedo tomarla en mi teléfono?',
        answer: 'Sí. Teléfono, tableta o computadora.',
      },
    ],
    counties: [
      { name: 'Adams', city: 'Gettysburg' },
      { name: 'Allegheny', city: 'Pittsburgh' },
      { name: 'Armstrong', city: 'Kittanning' },
      { name: 'Beaver', city: 'Beaver' },
      { name: 'Bedford', city: 'Bedford' },
      { name: 'Berks', city: 'Reading' },
      { name: 'Blair', city: 'Hollidaysburg' },
      { name: 'Bradford', city: 'Towanda' },
      { name: 'Bucks', city: 'Doylestown' },
      { name: 'Butler', city: 'Butler' },
      { name: 'Cambria', city: 'Ebensburg' },
      { name: 'Cameron', city: 'Emporium' },
      { name: 'Carbon', city: 'Jim Thorpe' },
      { name: 'Centre', city: 'Bellefonte' },
      { name: 'Chester', city: 'West Chester' },
      { name: 'Clarion', city: 'Clarion' },
      { name: 'Clearfield', city: 'Clearfield' },
      { name: 'Clinton', city: 'Lock Haven' },
      { name: 'Columbia', city: 'Bloomsburg' },
      { name: 'Crawford', city: 'Meadville' },
      { name: 'Cumberland', city: 'Carlisle' },
      { name: 'Dauphin', city: 'Harrisburg' },
      { name: 'Delaware', city: 'Media' },
      { name: 'Elk', city: 'Ridgway' },
      { name: 'Erie', city: 'Erie' },
      { name: 'Fayette', city: 'Uniontown' },
      { name: 'Forest', city: 'Tionesta' },
      { name: 'Franklin', city: 'Chambersburg' },
      { name: 'Fulton', city: 'McConnellsburg' },
      { name: 'Greene', city: 'Waynesburg' },
      { name: 'Huntingdon', city: 'Huntingdon' },
      { name: 'Indiana', city: 'Indiana' },
      { name: 'Jefferson', city: 'Brookville' },
      { name: 'Juniata', city: 'Mifflintown' },
      { name: 'Lackawanna', city: 'Scranton' },
      { name: 'Lancaster', city: 'Lancaster' },
      { name: 'Lawrence', city: 'New Castle' },
      { name: 'Lebanon', city: 'Lebanon' },
      { name: 'Lehigh', city: 'Allentown' },
      { name: 'Luzerne', city: 'Wilkes-Barre' },
      { name: 'Lycoming', city: 'Williamsport' },
      { name: 'McKean', city: 'Smethport' },
      { name: 'Mercer', city: 'Mercer' },
      { name: 'Mifflin', city: 'Lewistown' },
      { name: 'Monroe', city: 'Stroudsburg' },
      { name: 'Montgomery', city: 'Norristown' },
      { name: 'Montour', city: 'Danville' },
      { name: 'Northampton', city: 'Easton' },
      { name: 'Northumberland', city: 'Sunbury' },
      { name: 'Perry', city: 'New Bloomfield' },
      { name: 'Philadelphia', city: 'Philadelphia' },
      { name: 'Pike', city: 'Milford' },
      { name: 'Potter', city: 'Coudersport' },
      { name: 'Schuylkill', city: 'Pottsville' },
      { name: 'Snyder', city: 'Middleburg' },
      { name: 'Somerset', city: 'Somerset' },
      { name: 'Sullivan', city: 'Laporte' },
      { name: 'Susquehanna', city: 'Montrose' },
      { name: 'Tioga', city: 'Wellsboro' },
      { name: 'Union', city: 'Lewisburg' },
      { name: 'Venango', city: 'Franklin' },
      { name: 'Warren', city: 'Warren' },
      { name: 'Washington', city: 'Washington' },
      { name: 'Wayne', city: 'Honesdale' },
      { name: 'Westmoreland', city: 'Greensburg' },
      { name: 'Wyoming', city: 'Tunkhannock' },
      { name: 'York', city: 'York' },
    ],
  },

  // ===========================================================================
  // RHODE ISLAND
  // ===========================================================================
  'rhode-island': {
    slug: 'rhode-island',
    name: 'Rhode Island',
    nameEs: 'Rhode Island',
    countyCount: 5,
    additionalContent: 'Rhode Island tiene una comunidad hispana vibrante, especialmente en Providence, Central Falls, y Pawtucket. Los tribunales de familia en todo el estado reconocen nuestro nombre y aceptan nuestros certificados. El Original.',
    faqs: [
      {
        question: '¿Es aceptada en los tribunales de Rhode Island?',
        answer: 'Sí. En los 5 condados. El Original. El Certificado Más Aceptado.',
      },
      {
        question: '¿Cuándo recibo mi certificado?',
        answer: 'Inmediatamente. Notificamos a su abogado automáticamente.',
      },
      {
        question: '¿Cuánto tiempo toma?',
        answer: '4 horas. A su ritmo.',
      },
      {
        question: '¿Puedo tomarla en mi teléfono?',
        answer: 'Sí. Teléfono, tableta o computadora.',
      },
    ],
    counties: [
      { name: 'Bristol', city: 'Bristol' },
      { name: 'Kent', city: 'Warwick' },
      { name: 'Newport', city: 'Newport' },
      { name: 'Providence', city: 'Providence' },
      { name: 'Washington', city: 'Wakefield' },
    ],
  },

  // ===========================================================================
  // VERMONT
  // ===========================================================================
  'vermont': {
    slug: 'vermont',
    name: 'Vermont',
    nameEs: 'Vermont',
    countyCount: 14,
    additionalContent: 'Vermont tiene una comunidad hispana en crecimiento, especialmente en Burlington y las áreas agrícolas del estado. Los tribunales de familia en todo el estado reconocen nuestro nombre y aceptan nuestros certificados. El Original.',
    faqs: [
      {
        question: '¿Es aceptada en los tribunales de Vermont?',
        answer: 'Sí. En los 14 condados. El Original. El Certificado Más Aceptado.',
      },
      {
        question: '¿Cuándo recibo mi certificado?',
        answer: 'Inmediatamente. Notificamos a su abogado automáticamente.',
      },
      {
        question: '¿Cuánto tiempo toma?',
        answer: '4 horas. A su ritmo.',
      },
      {
        question: '¿Puedo tomarla en mi teléfono?',
        answer: 'Sí. Teléfono, tableta o computadora.',
      },
    ],
    counties: [
      { name: 'Addison', city: 'Middlebury' },
      { name: 'Bennington', city: 'Bennington' },
      { name: 'Caledonia', city: 'St. Johnsbury' },
      { name: 'Chittenden', city: 'Burlington' },
      { name: 'Essex', city: 'Guildhall' },
      { name: 'Franklin', city: 'St. Albans' },
      { name: 'Grand Isle', city: 'North Hero' },
      { name: 'Lamoille', city: 'Hyde Park' },
      { name: 'Orange', city: 'Chelsea' },
      { name: 'Orleans', city: 'Newport' },
      { name: 'Rutland', city: 'Rutland' },
      { name: 'Washington', city: 'Montpelier' },
      { name: 'Windham', city: 'Newfane' },
      { name: 'Windsor', city: 'Woodstock' },
    ],
  },
};
