/**
 * Shared type definitions for state data
 * Used by all regional files to avoid circular dependencies
 */

export interface County {
  name: string;
  city: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface StateData {
  slug: string;
  name: string;
  nameEs: string;
  countyCount: number;
  additionalContent: string;
  sectionHeading?: string;  // Optional - falls back to default in component
  faqs: FAQ[];
  counties: County[];
  
  // === SEO Content Expansion ===
  /** 2-3 paragraph state-specific intro — unique body content for Google */
  introContent?: string;
  /** 1-2 sentences on how family courts handle parenting classes in this state */
  courtContext?: string;
  /** Custom meta description (overrides template-generated) */
  metaDescription?: string;
}
