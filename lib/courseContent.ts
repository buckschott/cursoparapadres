// Course content configuration for multi-course curriculum
// Updated: February 2026
// Supports: coparenting (Co-Parenting Class) and parenting (Parenting Class)

export interface LessonSection {
  id: string;
  titleEs: string;
}

export interface CourseLesson {
  id: number;
  slug: string;
  titleEs: string;
  descriptionEs: string;
  estimatedTime: string;
  sections: LessonSection[];
}

export const TOTAL_LESSONS = 15;
export const TOTAL_MODULES = TOTAL_LESSONS; // Used by leccionpage.tsx, clasepage.tsx
export const QUESTIONS_PER_EXAM = 20;
export const PASS_THRESHOLD = 0.70;
export const PASS_SCORE = Math.ceil(QUESTIONS_PER_EXAM * PASS_THRESHOLD);

// ============================================
// CO-PARENTING CLASS (coparenting)
// ============================================

const coparentingLessons: CourseLesson[] = [
  {
    id: 1,
    slug: 'leccion-1',
    titleEs: 'Entendiendo lo que EstÃ¡ Pasando',
    descriptionEs: 'Entendiendo el duelo, la pÃ©rdida, y cÃ³mo los niÃ±os experimentan el divorcio a diferentes edades.',
    estimatedTime: '~24 min',
    sections: [
      { id: 'section_1_A', titleEs: 'El Divorcio como PÃ©rdida' },
      { id: 'section_1_B', titleEs: 'CÃ³mo los NiÃ±os Experimentan el Divorcio' }
    ]
  },
  {
    id: 2,
    slug: 'leccion-2',
    titleEs: 'ComunicÃ¡ndose con Sus Hijos',
    descriptionEs: 'CÃ³mo decirle a sus hijos sobre el divorcio y mantener comunicaciÃ³n abierta.',
    estimatedTime: '~20 min',
    sections: [
      { id: 'section_2', titleEs: 'ComunicÃ¡ndose con Sus Hijos' }
    ]
  },
  {
    id: 3,
    slug: 'leccion-3',
    titleEs: 'Preguntas Comunes de los NiÃ±os',
    descriptionEs: 'Respondiendo las preguntas difÃ­ciles que los niÃ±os hacen sobre el divorcio.',
    estimatedTime: '~15 min',
    sections: [
      { id: 'section_3', titleEs: 'Preguntas Comunes de los NiÃ±os' }
    ]
  },
  {
    id: 4,
    slug: 'leccion-4',
    titleEs: 'Apoyando el Bienestar Emocional',
    descriptionEs: 'Validando sentimientos, reconociendo seÃ±ales de advertencia, y desarrollando habilidades de afrontamiento.',
    estimatedTime: '~25 min',
    sections: [
      { id: 'section_4_A', titleEs: 'ValidaciÃ³n y Apoyo' },
      { id: 'section_4_B', titleEs: 'SeÃ±ales de Advertencia' },
      { id: 'section_4_C', titleEs: 'Desarrollando Habilidades de Afrontamiento' }
    ]
  },
  {
    id: 5,
    slug: 'leccion-5',
    titleEs: 'Manejando Sus Propias Emociones',
    descriptionEs: 'CuidÃ¡ndose a sÃ­ mismo/a para poder cuidar a sus hijos.',
    estimatedTime: '~18 min',
    sections: [
      { id: 'section_5', titleEs: 'Manejando Sus Propias Emociones' }
    ]
  },
  {
    id: 6,
    slug: 'leccion-6',
    titleEs: 'Trabajando con el Otro Padre',
    descriptionEs: 'Estrategias de coparentalidad, crianza paralela, y comunicaciÃ³n BIFF.',
    estimatedTime: '~20 min',
    sections: [
      { id: 'section_6_A', titleEs: 'Enfoques de Coparentalidad' },
      { id: 'section_6_B', titleEs: 'Estrategias de ComunicaciÃ³n' },
      { id: 'section_6_C', titleEs: 'Los Tres Grandes Errores' }
    ]
  },
  {
    id: 7,
    slug: 'leccion-7',
    titleEs: 'Seguridad y Apoyo',
    descriptionEs: 'Reconociendo el abuso, planificaciÃ³n de seguridad, y cuÃ¡ndo es necesaria la crianza paralela.',
    estimatedTime: '~16 min',
    sections: [
      { id: 'section_7_A', titleEs: 'Reconociendo el Abuso' },
      { id: 'section_7_B', titleEs: 'PlanificaciÃ³n de Seguridad' }
    ]
  },
  {
    id: 8,
    slug: 'leccion-8',
    titleEs: 'Realidades Financieras',
    descriptionEs: 'Entendiendo la manutenciÃ³n, manejando gastos, y protegiendo a los niÃ±os del estrÃ©s financiero.',
    estimatedTime: '~14 min',
    sections: [
      { id: 'section_8', titleEs: 'Realidades Financieras' }
    ]
  },
  {
    id: 9,
    slug: 'leccion-9',
    titleEs: 'Haciendo que el Tiempo de Crianza Funcione',
    descriptionEs: 'Horarios, rutinas, y haciendo que dos hogares se sientan como hogar.',
    estimatedTime: '~15 min',
    sections: [
      { id: 'section_9_A', titleEs: 'Horarios de Crianza' },
      { id: 'section_9_B', titleEs: 'Dos Hogares' }
    ]
  },
  {
    id: 10,
    slug: 'leccion-10',
    titleEs: 'Ayudando a los NiÃ±os a TravÃ©s de las Transiciones',
    descriptionEs: 'Haciendo los intercambios mÃ¡s fÃ¡ciles y ayudando a los niÃ±os a ajustarse a moverse entre hogares.',
    estimatedTime: '~16 min',
    sections: [
      { id: 'section_10', titleEs: 'Ayudando a los NiÃ±os a TravÃ©s de las Transiciones' }
    ]
  },
  {
    id: 11,
    slug: 'leccion-11',
    titleEs: 'DÃ­as Festivos, Hitos y Ocasiones Especiales',
    descriptionEs: 'Navegando dÃ­as festivos, cumpleaÃ±os, y eventos especiales entre dos hogares.',
    estimatedTime: '~23 min',
    sections: [
      { id: 'section_11_A', titleEs: 'DÃ­as Festivos' },
      { id: 'section_11_B', titleEs: 'CumpleaÃ±os e Hitos' }
    ]
  },
  {
    id: 12,
    slug: 'leccion-12',
    titleEs: 'El Primer AÃ±o y las Primeras Veces',
    descriptionEs: 'Navegando el primer aÃ±o despuÃ©s del divorcio y manejando momentos importantes.',
    estimatedTime: '~13 min',
    sections: [
      { id: 'section_12', titleEs: 'El Primer AÃ±o y las Primeras Veces' }
    ]
  },
  {
    id: 13,
    slug: 'leccion-13',
    titleEs: 'Cuando un Padre Se Desconecta',
    descriptionEs: 'Apoyando a su hijo cuando el otro padre estÃ¡ ausente o no involucrado.',
    estimatedTime: '~22 min',
    sections: [
      { id: 'section_13', titleEs: 'Cuando un Padre Se Desconecta' }
    ]
  },
  {
    id: 14,
    slug: 'leccion-14',
    titleEs: 'Recursos Adicionales',
    descriptionEs: 'Apoyo de crisis, encontrando terapeutas, herramientas de coparentalidad, y recursos especÃ­ficos de Florida.',
    estimatedTime: '~10 min',
    sections: [
      { id: 'section_14', titleEs: 'Recursos Adicionales' }
    ]
  },
  {
    id: 15,
    slug: 'leccion-15',
    titleEs: 'Cierre: Avanzando',
    descriptionEs: 'Reflexionando sobre su camino y planificando para el futuro.',
    estimatedTime: '~5 min',
    sections: [
      { id: 'section_15', titleEs: 'Avanzando' }
    ]
  }
];

// ============================================
// PARENTING CLASS (parenting)
// ============================================

const parentingLessons: CourseLesson[] = [
  {
    id: 1,
    slug: 'leccion-1',
    titleEs: 'Entendiendo el Desarrollo Infantil',
    descriptionEs: 'Por quÃ© importa el desarrollo, cÃ³mo piensan los niÃ±os a diferentes edades, y el temperamento de su hijo.',
    estimatedTime: '~20 min',
    sections: [
      { id: 'section_1_A', titleEs: 'CÃ³mo Piensan los NiÃ±os y QuÃ© Necesitan' },
      { id: 'section_1_B', titleEs: 'Su Hijo Ãšnico' }
    ]
  },
  {
    id: 2,
    slug: 'leccion-2',
    titleEs: 'CÃ³mo Piensan y Crecen los NiÃ±os',
    descriptionEs: 'Comportamientos normales por edad, expectativas realistas, y cuÃ¡ndo buscar ayuda.',
    estimatedTime: '~20 min',
    sections: [
      { id: 'section_2_A', titleEs: 'Desarrollo de BebÃ©s y NiÃ±os PequeÃ±os (0-3)' },
      { id: 'section_2_B', titleEs: 'Desarrollo Preescolar y Edad Escolar (3-12)' },
      { id: 'section_2_C', titleEs: 'Desarrollo Adolescente (12-18) y RegresiÃ³n' }
    ]
  },
  {
    id: 3,
    slug: 'leccion-3',
    titleEs: 'Construyendo Apego Seguro',
    descriptionEs: 'QuÃ© es el apego, servir y devolver, y reparar despuÃ©s de las rupturas.',
    estimatedTime: '~17 min',
    sections: [
      { id: 'section_3_A', titleEs: 'QuÃ© Es el Apego y Por QuÃ© Importa' },
      { id: 'section_3_B', titleEs: 'Construyendo Apego a TravÃ©s de Interacciones Diarias' },
      { id: 'section_3_C', titleEs: 'Reparar DespuÃ©s de las Rupturas' },
      { id: 'section_3_D', titleEs: 'Conceptos BÃ¡sicos de Crianza Informada por el Trauma' }
    ]
  },
  {
    id: 4,
    slug: 'leccion-4',
    titleEs: 'ComunicÃ¡ndose con Su Hijo',
    descriptionEs: 'Escucha activa, validaciÃ³n emocional, y el marco PACE para conversaciones difÃ­ciles.',
    estimatedTime: '~18 min',
    sections: [
      { id: 'section_4_A', titleEs: 'Escuchando para Entender' },
      { id: 'section_4_B', titleEs: 'Hablando para que los NiÃ±os Escuchen' },
      { id: 'section_4_C', titleEs: 'Un Marco para Conversaciones DifÃ­ciles' }
    ]
  },
  {
    id: 5,
    slug: 'leccion-5',
    titleEs: 'Entendiendo el Comportamiento',
    descriptionEs: 'Por quÃ© los niÃ±os se portan mal, el comportamiento como comunicaciÃ³n, y el mÃ©todo ABC.',
    estimatedTime: '~15 min',
    sections: [
      { id: 'section_5_A', titleEs: 'Por QuÃ© los NiÃ±os Se Portan Mal' },
      { id: 'section_5_B', titleEs: 'El MÃ©todo ABC' }
    ]
  },
  {
    id: 6,
    slug: 'leccion-6',
    titleEs: 'Estrategias de Disciplina Positiva',
    descriptionEs: 'Crianza autoritativa, estableciendo lÃ­mites, consecuencias naturales vs. lÃ³gicas.',
    estimatedTime: '~18 min',
    sections: [
      { id: 'section_6_A', titleEs: 'Fundamentos de la Disciplina' },
      { id: 'section_6_B', titleEs: 'Estrategias que Funcionan' }
    ]
  },
  {
    id: 7,
    slug: 'leccion-7',
    titleEs: 'Manejando Comportamientos Desafiantes',
    descriptionEs: 'Berrinches, desafÃ­o, agresiÃ³n, y cuÃ¡ndo buscar ayuda profesional.',
    estimatedTime: '~16 min',
    sections: [
      { id: 'section_7_A', titleEs: 'Comportamientos Comunes Desafiantes' },
      { id: 'section_7_B', titleEs: 'CuÃ¡ndo Buscar Ayuda' }
    ]
  },
  {
    id: 8,
    slug: 'leccion-8',
    titleEs: 'Inteligencia Emocional',
    descriptionEs: 'Entrenamiento emocional, ayudando a los niÃ±os a identificar y expresar sentimientos.',
    estimatedTime: '~15 min',
    sections: [
      { id: 'section_8_A', titleEs: 'QuÃ© Es la Inteligencia Emocional' },
      { id: 'section_8_B', titleEs: 'Entrenamiento Emocional en la PrÃ¡ctica' }
    ]
  },
  {
    id: 9,
    slug: 'leccion-9',
    titleEs: 'Ayudando a Su Hijo a Regularse',
    descriptionEs: 'AutorregulaciÃ³n, co-regulaciÃ³n, y enseÃ±ando estrategias de calma.',
    estimatedTime: '~15 min',
    sections: [
      { id: 'section_9_A', titleEs: 'Entendiendo la AutorregulaciÃ³n' },
      { id: 'section_9_B', titleEs: 'Ayudando a Su Hijo a Calmarse' }
    ]
  },
  {
    id: 10,
    slug: 'leccion-10',
    titleEs: 'CuidÃ¡ndose a SÃ­ Mismo',
    descriptionEs: 'Bienestar parental, reconociendo el agotamiento, y manejando la ira.',
    estimatedTime: '~18 min',
    sections: [
      { id: 'section_10_A', titleEs: 'Por QuÃ© Importa Su Bienestar' },
      { id: 'section_10_B', titleEs: 'Cuando Pierde la Calma' }
    ]
  },
  {
    id: 11,
    slug: 'leccion-11',
    titleEs: 'Manteniendo a Su Hijo Seguro',
    descriptionEs: 'Seguridad corporal, prevenciÃ³n del abuso, y enseÃ±ando lÃ­mites.',
    estimatedTime: '~16 min',
    sections: [
      { id: 'section_11_A', titleEs: 'Seguridad Corporal y PrevenciÃ³n' },
      { id: 'section_11_B', titleEs: 'Reconociendo SeÃ±ales de Advertencia' }
    ]
  },
  {
    id: 12,
    slug: 'leccion-12',
    titleEs: 'TecnologÃ­a y Crianza Moderna',
    descriptionEs: 'El marco de las 5 Cs, tiempo de pantalla por edad, y seguridad en lÃ­nea.',
    estimatedTime: '~12 min',
    sections: [
      { id: 'section_12_A', titleEs: 'Tomando Decisiones Inteligentes sobre el Tiempo de Pantalla' },
      { id: 'section_12_B', titleEs: 'Conceptos BÃ¡sicos de Seguridad en LÃ­nea' }
    ]
  },
  {
    id: 13,
    slug: 'leccion-13',
    titleEs: 'Construyendo Resiliencia',
    descriptionEs: 'Mentalidad de crecimiento, elogio al proceso, y fomentando la autonomÃ­a.',
    estimatedTime: '~12 min',
    sections: [
      { id: 'section_13_A', titleEs: 'QuÃ© Construye la Resiliencia' },
      { id: 'section_13_B', titleEs: 'Estrategias PrÃ¡cticas' }
    ]
  },
  {
    id: 14,
    slug: 'leccion-14',
    titleEs: 'Recursos Adicionales',
    descriptionEs: 'Apoyo de crisis, encontrando terapeutas, y glosario de tÃ©rminos clave.',
    estimatedTime: '~8 min',
    sections: [
      { id: 'section_14_A', titleEs: 'Obteniendo Ayuda Cuando la Necesita' },
      { id: 'section_14_B', titleEs: 'Continuando Su Aprendizaje' }
    ]
  },
  {
    id: 15,
    slug: 'leccion-15',
    titleEs: 'Cierre: Avanzando',
    descriptionEs: 'Principios clave, guÃ­a de referencia, y prÃ³ximos pasos.',
    estimatedTime: '~4 min',
    sections: [
      { id: 'section_15_A', titleEs: 'Principios Clave para Recordar' },
      { id: 'section_15_B', titleEs: 'Sus PrÃ³ximos Pasos' }
    ]
  }
];

// ============================================
// COURSE LESSONS BY TYPE
// ============================================

export const allCourseLessons: Record<string, CourseLesson[]> = {
  coparenting: coparentingLessons,
  parenting: parentingLessons
};

// Used by clasepage.tsx — alias for coparentingLessons
export const courseModules = coparentingLessons;

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getCourseLessons(courseType: string): CourseLesson[] {
  return allCourseLessons[courseType] || coparentingLessons;
}

export function getLessonBySlug(slug: string, courseType?: string): CourseLesson | undefined {
  const lessons = courseType ? getCourseLessons(courseType) : coparentingLessons;
  return lessons.find(l => l.slug === slug);
}

export function getLessonById(id: number, courseType?: string): CourseLesson | undefined {
  const lessons = courseType ? getCourseLessons(courseType) : coparentingLessons;
  return lessons.find(l => l.id === id);
}

export function getSectionLesson(sectionId: string, courseType?: string): CourseLesson | undefined {
  const lessons = courseType ? getCourseLessons(courseType) : coparentingLessons;
  return lessons.find(l => l.sections.some(s => s.id === sectionId));
}

export function getTotalLessons(): number {
  return TOTAL_LESSONS;
}

// ============================================
// COURSE TYPE CONFIGURATION
// ============================================

export const courseTypeNames: Record<string, { en: string; es: string }> = {
  coparenting: {
    en: 'Co-Parenting Class',
    es: 'Clase de Coparentalidad'
  },
  parenting: {
    en: 'Parenting Class',
    es: 'Clase de Crianza'
  }
};

// ============================================
// CONTENT FILE PATHS
// ============================================

export function getContentFileName(lessonId: number, courseType?: string): string {
  // Both courses use subfolder structure: /content/{courseType}/leccion-{id}.md
  const folder = courseType === 'parenting' ? 'parenting' : 'coparenting';
  return `${folder}/leccion-${lessonId}.md`;
}

export function getContentPath(lessonId: number, courseType?: string): string {
  return `/content/${getContentFileName(lessonId, courseType)}`;
}

// Used by leccionpage.tsx — empty placeholder for supplemental lesson data
export const supplementalContent: any[] = [];
