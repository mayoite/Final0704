import {
  Catalog_CATEGORY_ORDER,
  buildCatalogCategoryNav,
} from "@/lib/catalogCategories";
import { SITE_CONTACT } from "@/data/site/contact";

export const SITE_NAV_LINKS = [
  { label: "Products", href: "/products", hasMega: true },
  { label: "Planner", href: "/planners" },
  { label: "Partner Login", href: "/login" },
  { label: "Solutions", href: "/solutions" },
  { label: "Projects", href: "/projects" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "About", href: "/about" },
] as const;

export const SITE_CTA_LINKS = [
  { label: "Get Quote", href: "/contact", variant: "primary" as const },
  { label: "View Products", href: "/products", variant: "outline" as const },
] as const;

export const SITE_NAV_FEATURED_CARDS = [
  {
    title: "Ergonomic Seating",
    description: "Mesh chairs and premium seating for long working hours.",
    href: "/products/seating",
    image: "/images/products/imported/fluid/image-1.webp",
  },
  {
    title: "Modular Workstations",
    description: "Scalable desking systems for growing teams.",
    href: "/products/workstations",
    image: "/images/products/imported/cabin/image-1.webp",
  },
  {
    title: "Need Help Choosing?",
    description: "Use AI-assisted search to find the right furniture faster.",
    href: "/products",
    image: "/images/products/imported/cocoon/image-1.webp",
  },
] as const;

export const SITE_NAV_SEARCH_FALLBACK_LINKS = [
  { href: "/products", label: "All Products" },
  { href: "/solutions", label: "Solutions" },
  { href: "/projects", label: "Projects" },
] as const;

const productLinks = [
  { href: "/products", label: "All Products" },
  ...buildCatalogCategoryNav(Catalog_CATEGORY_ORDER),
];

export const SITE_FOOTER_NAV = [
  {
    heading: "Products",
    links: productLinks,
  },
  {
    heading: "Workspace Types",
    links: [
      { href: "/solutions", label: "All Solutions" },
      { href: "/products/seating", label: "Ergonomic Seating" },
      { href: "/products/workstations", label: "Workstation Setup" },
      { href: "/products/tables", label: "Meeting Rooms" },
      { href: "/products/storages", label: "Storage & Filing" },
      { href: "/solutions", label: "Space Planning" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/login", label: "Partner Portal" },
      { href: "/trusted-by", label: "Trusted By" },
      { href: "/projects", label: "Projects" },
      { href: "/sustainability", label: "Sustainability" },
      { href: "/service", label: "After Sales" },
      { href: "/career", label: "Careers" },
      { href: "/news", label: "News" },
      { href: "/imprint", label: "Imprint" },
    ],
  },
  {
    heading: "Support & Tools",
    links: [
      { href: "/planners", label: "All Planners" },
      { href: "/planner", label: "Live Planner" },
      { href: "/planner-blueprint", label: "Blueprint Planner" },
      { href: "/planner1", label: "Planner 1" },
      { href: "/planner-lab", label: "Planner Lab" },
      { href: "/draw", label: "Draw" },
      { href: "/configurator", label: "Configurator" },
      { href: "/login", label: "Partner Portal" },
      { href: "/contact", label: "Contact Us" },
      { href: "/faq", label: "FAQ" },
      { href: "/downloads", label: "Downloads" },
      { href: "/showrooms", label: "Showrooms" },
    ],
  },
] as const;

export const SITE_SOCIAL_LINKS = SITE_CONTACT.socialLinks;
