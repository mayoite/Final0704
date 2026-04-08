import { type ReactNode } from "react";

export interface HomepageHeroContent {
  title: string[];
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  proofItems: Array<{ label: string; value: string }>;
  sidePanel: {
    stat: string;
    title: string;
    description: string;
  };
}

export interface HomepageTrustContent {
  logoLabel: string;
  logos: Array<{ name: string; src: string }>;
  projectsCta: string;
}

export interface HomepageCollectionItem {
  name: string;
  image: string;
  href: string;
}

export interface HomepageCollectionsContent {
  titleLead: string;
  titleAccent: string;
  items: HomepageCollectionItem[];
}

export interface HomepageProjectItem {
  sector: string;
  companyName: string;
  outcome: string;
  image: string;
}

export interface HomepageProjectsContent {
  titleLead: string;
  titleAccent: string;
  cta: { label: string; href: string };
  cards: HomepageProjectItem[];
}

export interface ShowcaseCarouselItem {
  id: string;
  name: string;
  label: string;
  image: string;
  description?: string;
  link: string;
}

export interface HomepageShowcaseContent {
  sectionLabel: string;
  sectionTitle: string | ReactNode;
  items: ShowcaseCarouselItem[];
}

export interface HomepageProcessStep {
  title: string;
  sla: string;
  deliverable: string;
  description: string;
}

export interface HomepageProcessContent {
  kicker: string;
  titleLead: string;
  titleAccent: string;
  description: string;
  cta: { label: string; href: string };
  steps: HomepageProcessStep[];
}

export interface HomepageFaqItem {
  q: string;
  a: string;
}

export interface HomepageFaqContent {
  titleLead: string;
  items: HomepageFaqItem[];
}

export interface HomepageContactContent {
  titleLead: string;
  titleAccent: string;
  description: string;
  directActions: Array<{
    type: string;
    label: string;
    detail: string;
  }>;
}

