// Course content configuration for multi-course curriculum
// Updated: December 2025
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
export const QUESTIONS_PER_EXAM = 20;
export const PASS_THRESHOLD = 0.70;
export const PASS_SCORE = Math.ceil(QUESTIONS_PER_EXAM * PASS_THRESHOLD);

// Legacy exports for compatibility
export const TOTAL_MODULES = TOTAL_LESSONS;

// ============================================
// CO-PARENTING CLASS (coparenting)
// ============================================

const coparentingLessons: CourseLesson[] = [
  {
    id: 1,
    slug: 'leccion-1',
    titleEs: 'Entendiendo lo que Está Pasando',
    descriptionEs: 'Entendiendo el duelo, la pérdida, y cómo los niños experimentan el divorcio a diferentes edades.',
    estimatedTime: '~24 min',
    sections: [
      { id: 'section_1_A', titleEs: 'El Divorcio como Pérdida' },
      { id: 'section_1_B', titleEs: 'Cómo los Niños Experimentan el Divorcio' }
    ]
  },
  {
    id: 2,
    slug: 'leccion-2',
    titleEs: 'Comunicándose con Sus Hijos',
    descriptionEs: 'Cómo decirle a sus hijos sobre el divorcio y mantener comunicación abierta.',
    estimatedTime: '~20 min',
    sections: [
      { id: 'section_2', titleEs: 'Comunicándose con Sus Hijos' }
    ]
  },
  {
    id: 3,
    slug: 'leccion-3',
    titleEs: 'Preguntas Comunes de los Niños',
    descriptionEs: 'Respondiendo las preguntas difíciles que los niños hacen sobre el divorcio.',
    estimatedTime: '~15 min',
    sections: [
      { id: 'section_3', titleEs: 'Preguntas Comunes de los Niños' }
    ]
  },
  {
    id: 4,
    slug: 'leccion-4',
    titleEs: 'Apoyando el Bienestar Emocional',
    descriptionEs: 'Validando sentimientos, reconociendo señales de advertencia, y desarrollando habilidades de afrontamiento.',
    estimatedTime: '~25 min',
    sections: [
      { id: 'section_4_A', titleEs: 'Validación y Apoyo' },
      { id: 'section_4_B', titleEs: 'Señales de Advertencia' },
      { id: 'section_4_C', titleEs: 'Desarrollando Habilidades de Afrontamiento' }
    ]
  },
  {
    id: 5,
    slug: 'leccion-5',
    titleEs: 'Manejando Sus Propias Emociones',
    descriptionEs: 'Cuidándose a sí mismo/a para poder cuidar a sus hijos.',
    estimatedTime: '~18 min',
    sections: [
      { id: 'section_5', titleEs: 'Manejando Sus Propias Emociones' }
    ]
  },
  {
    id: 6,
    slug: 'leccion-6',
    titleEs: 'Trabajando con el Otro Padre',
    descriptionEs: 'Estrategias de coparentalidad, crianza paralela, y comunicación BIFF.',
    estimatedTime: '~20 min',
    sections: [
      { id: 'section_6_A', titleEs: 'Enfoques de Coparentalidad' },
      { id: 'section_6_B', titleEs: 'Estrategias de Comunicación' },
      { id: 'section_6_C', titleEs: 'Los Tres Grandes Errores' }
    ]
  },
  {
    id: 7,
    slug: 'leccion-7',
    titleEs: 'Seguridad y Apoyo',
    descriptionEs: 'Reconociendo el abuso, planificación de seguridad, y cuándo es necesaria la crianza paralela.',
    estimatedTime: '~16 min',
    sections: [
      { id: 'section_7_A', titleEs: 'Reconociendo el Abuso' },
      { id: 'section_7_B', titleEs: 'Planificación de Seguridad' }
    ]
  },
  {
    id: 8,
    slug: 'leccion-8',
    titleEs: 'Realidades Financieras',
    descriptionEs: 'Entendiendo la manutención, manejando gastos, y protegiendo a los niños del estrés financiero.',
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
    titleEs: 'Ayudando a los Niños a Través de las Transiciones',
    descriptionEs: 'Haciendo los intercambios más fáciles y ayudando a los niños a ajustarse a moverse entre hogares.',
    estimatedTime: '~16 min',
    sections: [
      { id: 'section_10', titleEs: 'Ayudando a los Niños a Través de las Transiciones' }
    ]
  },
  {
    id: 11,
    slug: 'leccion-11',
    titleEs: 'Días Festivos, Hitos y Ocasiones Especiales',
    descriptionEs: 'Navegando días festivos, cumpleaños, y eventos especiales entre dos hogares.',
    estimatedTime: '~23 min',
    sections: [
      { id: 'section_11_A', titleEs: 'Días Festivos' },
      { id: 'section_11_B', titleEs: 'Cumpleaños e Hitos' }
    ]
  },
  {
    id: 12,
    slug: 'leccion-12',
    titleEs: 'El Primer Año y las Primeras Veces',
    descriptionEs: 'Navegando el primer año después del divorcio y manejando momentos importantes.',
    estimatedTime: '~13 min',
    sections: [
      { id: 'section_12', titleEs: 'El Primer Año y las Primeras Veces' }
    ]
  },
  {
    id: 13,
    slug: 'leccion-13',
    titleEs: 'Cuando un Padre Se Desconecta',
    descriptionEs: 'Apoyando a su hijo cuando el otro padre está ausente o no involucrado.',
    estimatedTime: '~22 min',
    sections: [
      { id: 'section_13', titleEs: 'Cuando un Padre Se Desconecta' }
    ]
  },
  {
    id: 14,
    slug: 'leccion-14',
    titleEs: 'Recursos Adicionales',
    descriptionEs: 'Apoyo de crisis, encontrando terapeutas, herramientas de coparentalidad, y recursos específicos de Florida.',
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
    descriptionEs: 'Por qué importa el desarrollo, cómo piensan los niños a diferentes edades, y el temperamento de su hijo.',
    estimatedTime: '~20 min',
    sections: [
      { id: 'section_1_A', titleEs: 'Cómo Piensan los Niños y Qué Necesitan' },
      { id: 'section_1_B', titleEs: 'Su Hijo Único' }
    ]
  },
  {
    id: 2,
    slug: 'leccion-2',
    titleEs: 'Cómo Piensan y Crecen los Niños',
    descriptionEs: 'Comportamientos normales por edad, expectativas realistas, y cuándo buscar ayuda.',
    estimatedTime: '~20 min',
    sections: [
      { id: 'section_2_A', titleEs: 'Desarrollo de Bebés y Niños Pequeños (0-3)' },
      { id: 'section_2_B', titleEs: 'Desarrollo Preescolar y Edad Escolar (3-12)' },
      { id: 'section_2_C', titleEs: 'Desarrollo Adolescente (12-18) y Regresión' }
    ]
  },
  {
    id: 3,
    slug: 'leccion-3',
    titleEs: 'Construyendo Apego Seguro',
    descriptionEs: 'Qué es el apego, servir y devolver, y reparar después de las rupturas.',
    estimatedTime: '~17 min',
    sections: [
      { id: 'section_3_A', titleEs: 'Qué Es el Apego y Por Qué Importa' },
      { id: 'section_3_B', titleEs: 'Construyendo Apego a Través de Interacciones Diarias' },
      { id: 'section_3_C', titleEs: 'Reparar Después de las Rupturas' },
      { id: 'section_3_D', titleEs: 'Conceptos Básicos de Crianza Informada por el Trauma' }
    ]
  },
  {
    id: 4,
    slug: 'leccion-4',
    titleEs: 'Comunicándose con Su Hijo',
    descriptionEs: 'Escucha activa, validación emocional, y el marco PACE para conversaciones difíciles.',
    estimatedTime: '~18 min',
    sections: [
      { id: 'section_4_A', titleEs: 'Escuchando para Entender' },
      { id: 'section_4_B', titleEs: 'Hablando para que los Niños Escuchen' },
      { id: 'section_4_C', titleEs: 'Un Marco para Conversaciones Difíciles' }
    ]
  },
  {
    id: 5,
    slug: 'leccion-5',
    titleEs: 'Entendiendo el Comportamiento',
    descriptionEs: 'Por qué los niños se portan mal, el comportamiento como comunicación, y el método ABC.',
    estimatedTime: '~15 min',
    sections: [
      { id: 'section_5_A', titleEs: 'Por Qué los Niños Se Portan Mal' },
      { id: 'section_5_B', titleEs: 'El Método ABC' }
    ]
  },
  {
    id: 6,
    slug: 'leccion-6',
    titleEs: 'Estrategias de Disciplina Positiva',
    descriptionEs: 'Crianza autoritativa, estableciendo límites, consecuencias naturales vs. lógicas.',
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
    descriptionEs: 'Berrinches, desafío, agresión, y cuándo buscar ayuda profesional.',
    estimatedTime: '~16 min',
    sections: [
      { id: 'section_7_A', titleEs: 'Comportamientos Comunes Desafiantes' },
      { id: 'section_7_B', titleEs: 'Cuándo Buscar Ayuda' }
    ]
  },
  {
    id: 8,
    slug: 'leccion-8',
    titleEs: 'Inteligencia Emocional',
    descriptionEs: 'Entrenamiento emocional, ayudando a los niños a identificar y expresar sentimientos.',
    estimatedTime: '~15 min',
    sections: [
      { id: 'section_8_A', titleEs: 'Qué Es la Inteligencia Emocional' },
      { id: 'section_8_B', titleEs: 'Entrenamiento Emocional en la Práctica' }
    ]
  },
  {
    id: 9,
    slug: 'leccion-9',
    titleEs: 'Ayudando a Su Hijo a Regularse',
    descriptionEs: 'Autorregulación, co-regulación, y enseñando estrategias de calma.',
    estimatedTime: '~15 min',
    sections: [
      { id: 'section_9_A', titleEs: 'Entendiendo la Autorregulación' },
      { id: 'section_9_B', titleEs: 'Ayudando a Su Hijo a Calmarse' }
    ]
  },
  {
    id: 10,
    slug: 'leccion-10',
    titleEs: 'Cuidándose a Sí Mismo',
    descriptionEs: 'Bienestar parental, reconociendo el agotamiento, y manejando la ira.',
    estimatedTime: '~18 min',
    sections: [
      { id: 'section_10_A', titleEs: 'Por Qué Importa Su Bienestar' },
      { id: 'section_10_B', titleEs: 'Cuando Pierde la Calma' }
    ]
  },
  {
    id: 11,
    slug: 'leccion-11',
    titleEs: 'Manteniendo a Su Hijo Seguro',
    descriptionEs: 'Seguridad corporal, prevención del abuso, y enseñando límites.',
    estimatedTime: '~16 min',
    sections: [
      { id: 'section_11_A', titleEs: 'Seguridad Corporal y Prevención' },
      { id: 'section_11_B', titleEs: 'Reconociendo Señales de Advertencia' }
    ]
  },
  {
    id: 12,
    slug: 'leccion-12',
    titleEs: 'Tecnología y Crianza Moderna',
    descriptionEs: 'El marco de las 5 Cs, tiempo de pantalla por edad, y seguridad en línea.',
    estimatedTime: '~12 min',
    sections: [
      { id: 'section_12_A', titleEs: 'Tomando Decisiones Inteligentes sobre el Tiempo de Pantalla' },
      { id: 'section_12_B', titleEs: 'Conceptos Básicos de Seguridad en Línea' }
    ]
  },
  {
    id: 13,
    slug: 'leccion-13',
    titleEs: 'Construyendo Resiliencia',
    descriptionEs: 'Mentalidad de crecimiento, elogio al proceso, y fomentando la autonomía.',
    estimatedTime: '~12 min',
    sections: [
      { id: 'section_13_A', titleEs: 'Qué Construye la Resiliencia' },
      { id: 'section_13_B', titleEs: 'Estrategias Prácticas' }
    ]
  },
  {
    id: 14,
    slug: 'leccion-14',
    titleEs: 'Recursos Adicionales',
    descriptionEs: 'Apoyo de crisis, encontrando terapeutas, y glosario de términos clave.',
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
    descriptionEs: 'Principios clave, guía de referencia, y próximos pasos.',
    estimatedTime: '~4 min',
    sections: [
      { id: 'section_15_A', titleEs: 'Principios Clave para Recordar' },
      { id: 'section_15_B', titleEs: 'Sus Próximos Pasos' }
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

// Default export for backward compatibility (co-parenting)
export const courseLessons = coparentingLessons;

// Legacy export for compatibility with existing code
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

// Legacy functions for compatibility
export function getModuleBySlug(slug: string, courseType?: string): CourseLesson | undefined {
  return getLessonBySlug(slug, courseType);
}

export function getModuleById(id: number, courseType?: string): CourseLesson | undefined {
  return getLessonById(id, courseType);
}

export function getSectionLesson(sectionId: string, courseType?: string): CourseLesson | undefined {
  const lessons = courseType ? getCourseLessons(courseType) : coparentingLessons;
  return lessons.find(l => l.sections.some(s => s.id === sectionId));
}

// Legacy function
export function getSectionModule(sectionId: string, courseType?: string): CourseLesson | undefined {
  return getSectionLesson(sectionId, courseType);
}

export function getTotalLessons(): number {
  return TOTAL_LESSONS;
}

export function getTotalModules(): number {
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

// ============================================
// SUPPLEMENTAL CONTENT
// ============================================

export const supplementalContent: any[] = [];
export const additionalContent: any[] = [];