// ================= COMMON TYPES =================

export interface SectionTitleProps {
  text1: string;
  text2: string;
  text3?: string; // ✅ optional (more flexible)
}

// ================= TESTIMONIAL =================

export interface ITestimonial {
  image: string;
  name: string;
  handle: string;
  date: string;
  quote: string;
}

export interface TestimonialCardProps {
  testimonial: ITestimonial;
  index: number;
}

// ================= FEATURES =================

export interface IFeature {
  icon: string;
  title: string;
  description: string;
}

// ================= NAVBAR =================

export interface INavLink {
  name: string;
  href: string;
}

export interface NavbarProps {
  navLinks: INavLink[]; // ✅ consistent naming
}

// ================= FOOTER =================

export interface IFooterLink {
  name: string;
  href: string;
}

export interface IFooter {
  title: string;
  links: IFooterLink[];
}

// ================= PRICING =================

export interface IPricing {
  name: string;
  price: number;
  period: string;
  features: string[];
  mostPopular?: boolean; // ✅ optional
}

export interface PricingCardProps {
  pricing: IPricing;
  index: number;
}

// ================= SECTION =================

export interface SectionProps {
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
}