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
}
