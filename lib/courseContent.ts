// Course content configuration for 15-lesson curriculum (13 core + 2 closing)
// Updated: December 2025 - Lecciones (Spanish curriculum)

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

export const courseLessons: CourseLesson[] = [
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

// Legacy export for compatibility with existing code
export const courseModules = courseLessons;

export function getLessonBySlug(slug: string): CourseLesson | undefined {
  return courseLessons.find(l => l.slug === slug);
}

export function getLessonById(id: number): CourseLesson | undefined {
  return courseLessons.find(l => l.id === id);
}

// Legacy functions for compatibility
export function getModuleBySlug(slug: string): CourseLesson | undefined {
  return getLessonBySlug(slug);
}

export function getModuleById(id: number): CourseLesson | undefined {
  return getLessonById(id);
}

export function getSectionLesson(sectionId: string): CourseLesson | undefined {
  return courseLessons.find(l => l.sections.some(s => s.id === sectionId));
}

// Legacy function
export function getSectionModule(sectionId: string): CourseLesson | undefined {
  return getSectionLesson(sectionId);
}

export function getTotalLessons(): number {
  return TOTAL_LESSONS;
}

export function getTotalModules(): number {
  return TOTAL_LESSONS;
}

export const courseTypeNames = {
  coparenting: {
    en: 'Co-Parenting Class',
    es: 'Clase de Coparentalidad'
  },
  parenting: {
    en: 'Parenting Class',
    es: 'Clase de Crianza'
  }
};

export function getContentFileName(lessonId: number): string {
  return `leccion-${lessonId}.md`;
}

export const supplementalContent: any[] = [];
export const additionalContent: any[] = [];
