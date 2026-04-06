import { 
  HomepageHeroContent, 
  HomepageTrustContent, 
  HomepageCollectionsContent, 
  HomepageProjectsContent,
  HomepageShowcaseContent,
  HomepageProcessContent,
  HomepageFaqContent,
  HomepageContactContent
} from "@/types/homepage";

export const HOMEPAGE_HERO_CONTENT: HomepageHeroContent = {
  title: ["Spaces that work", "as hard as", "your team."],
  description:
    "Furniture systems for offices, campuses, and operational teams with planning, delivery, and after-sales support aligned from brief to handover.",
  primaryCta: { label: "Explore Products", href: "/products" },
  secondaryCta: { label: "Request Quote", href: "/contact" },
  proofItems: [
    { label: "Selected clients", value: "DMRC, Titan, Tata Steel" },
    { label: "Service", value: "Planning, installation, after-sales" },
  ],
  sidePanel: {
    stat: "Pan-India delivery",
    title: "Planning first. Installation without drift.",
    description:
      "Furniture systems for offices, campuses, and operational environments with direct support from brief to handover.",
  },
} as const;

export const HOMEPAGE_TRUST_CONTENT: HomepageTrustContent = {
  logoLabel: "Selected organisations",
  logos: [
    { name: "L&T", src: "/ClientLogos/LandT.png" },
    { name: "JSW", src: "/ClientLogos/JSW.png" },
    { name: "Tata Motors", src: "/ClientLogos/TataMotors.jpg" },
    { name: "Maruti Suzuki", src: "/ClientLogos/MarutiSuzuki.png" },
    { name: "HDFC", src: "/ClientLogos/HDFCLogo.jpg" },
    { name: "Canara Bank", src: "/ClientLogos/CanaraBank.jpg" },
    { name: "Franklin Templeton", src: "/ClientLogos/FranklinTempleton.jpg" },
    { name: "Hyundai", src: "/ClientLogos/HyundaiLogo.jpg" },
    { name: "IDBI Bank", src: "/ClientLogos/IDBIBankLogo.png" },
    { name: "Usha", src: "/ClientLogos/USHA.png" },
    { name: "Bihar Government", src: "/ClientLogos/BiharGovernment.jpg" },
    { name: "SAIL", src: "/ClientLogos/SAIL.png" },
    { name: "BIS", src: "/ClientLogos/BIS.jpg" },
    { name: "Sonalika", src: "/ClientLogos/Sonalika.jpg" },
    { name: "Survey of India", src: "/ClientLogos/SurveyofIndia.jpg" },
    { name: "CRI Pumps", src: "/ClientLogos/CRIPumps.jpg" },
    { name: "MECON", src: "/ClientLogos/MECON.jpg" },
  ],
  projectsCta: "View projects",
} as const;

export const HOMEPAGE_BRAND_STATEMENT_CONTENT = {
  lead:
    "We have been designing and installing workplaces across India since 2011.",
  body:
    "Not just interiors, but working environments that help teams focus, collaborate, and stay productive. Built for organizations that cannot afford unclear planning or weak execution.",
} as const;

export const HOMEPAGE_COLLECTIONS_CONTENT: HomepageCollectionsContent = {
  titleLead: "Browse",
  titleAccent: "workspace categories",
  items: [
    {
      name: "Seating",
      image: "/images/products/seating-myel-1.webp",
      href: "/products/seating",
    },
    {
      name: "Workstations",
      image: "/images/products/deskpro-workstation-1.webp",
      href: "/products/workstations",
    },
    {
      name: "Tables",
      image: "/images/products/meeting-table-10pax.webp",
      href: "/products/tables",
    },
    {
      name: "Storage",
      image: "/images/products/imported/storage/image-14.webp",
      href: "/products/storages",
    },
    {
      name: "Soft Seating",
      image: "/images/products/softseating-solace-1.webp",
      href: "/products/soft-seating",
    },
    {
      name: "Education",
      image: "/images/products/chair-cafeteria.webp",
      href: "/products/education",
    },
  ],
} as const;

export const HOMEPAGE_PROJECTS_CONTENT: HomepageProjectsContent = {
  titleLead: "Recent",
  titleAccent: "projects",
  cta: { label: "View gallery", href: "/portfolio" },
  cards: [
    {
      sector: "Government",
      companyName: "DMRC",
      outcome: "Workstations and seating across operational zones",
      image: "/ClientPhotos/DMRC/hero.webp",
    },
    {
      sector: "Corporate",
      companyName: "Titan Limited",
      outcome: "Full-floor ergonomic rollout at Patna headquarters",
      image: "/ClientPhotos/Titan/hero.webp",
    },
    {
      sector: "Automobile",
      companyName: "TVS Motors",
      outcome: "Multi-seat workstation fit-out for regional office",
      image: "/ClientPhotos/TVS/hero.webp",
    },
    {
      sector: "Institutional",
      companyName: "Usha Workspace",
      outcome: "Integrated storage, seating, and collaboration zones",
      image: "/ClientPhotos/Usha/hero.webp",
    },
  ],
} as const;

export const HOMEPAGE_SHOWCASE_CONTENT: HomepageShowcaseContent = {
  sectionLabel: "Selected Projects",
  sectionTitle: "Delivered at scale for India's leading organizations.",
  items: [
    {
      id: "dmrc-patna",
      name: "DMRC Patna HQ",
      label: "Government",
      image: "/images/montage/dmrc-1.png",
      description: "Complete workstation rollout for the Patna Metro project headquarters.",
      link: "/projects/dmrc"
    },
    {
      id: "titan-hq",
      name: "Titan Bihar HQ",
      label: "Corporate",
      image: "/images/montage/titan-blue-1.png",
      description: "Full-floor operations zone including executive cabins and staff zones.",
      link: "/projects/titan"
    },
    {
      id: "green-desk-1",
      name: "Tata Steel Operations",
      label: "Industrial",
      image: "/images/montage/green-desk-1.png",
      description: "Custom layout optimized for durability and heavy-duty documentation flow.",
      link: "/projects/tatasteel"
    },
    {
      id: "tvs-bihar",
      name: "TVS Motors",
      label: "Automobile",
      image: "/images/montage/dmrc-2.png",
      description: "Modular seating and desk systems for regional service hubs.",
      link: "/projects/tvs"
    },
    {
      id: "boardroom-client",
      name: "Executive Boardroom",
      label: "Corporate",
      image: "/images/client-projects/meeting-room.png",
      description: "Custom conference table with ergonomic high-back executive seating.",
      link: "/projects/boardroom"
    },
    {
      id: "open-office-client",
      name: "Operations Hub",
      label: "Enterprise",
      image: "/images/client-projects/open-office-1.png",
      description: "Scalable 100+ seater open plan layout with acoustic screening.",
      link: "/projects/operations"
    },
    {
      id: "green-workstations-client",
      name: "Collaborative Zone",
      label: "Public Sector",
      image: "/images/client-projects/green-workstations.png",
      description: "Modular workstations featuring integrated storage hubs and privacy dividers.",
      link: "/projects/collaborative"
    },
    {
      id: "blue-workstations-client",
      name: "Technical Staff Wing",
      label: "Institutional",
      image: "/images/client-projects/blue-workstations.png",
      description: "Ergonomic linear workstations with task-focused layout optimization.",
      link: "/projects/technical"
    }
  ]
} as const;

export const HOMEPAGE_CONTACT_CONTENT: HomepageContactContent = {
  titleLead: "Start with one",
  titleAccent: "clear brief.",
  description: "Share your city, scope, and timeline. We'll route the right next step.",
  directActions: [
    {
      type: "whatsapp",
      label: "WhatsApp now",
      detail: "Fastest response",
    },
    {
      type: "phone",
      label: "Call team",
      detail: "Talk to support",
    },
  ],
} as const;

export const HOMEPAGE_STATS_CONTENT = [
  { value: "14+", label: "Years delivering workspaces" },
  { value: "500+", label: "Projects completed" },
  { value: "50+", label: "Partner brands and product lines" },
  { value: "24/7", label: "After-sales support routing" },
] as const;

export const HOMEPAGE_PROCESS_CONTENT: HomepageProcessContent = {
  kicker: "",
  titleLead: "A clear",
  titleAccent: "delivery system.",
  description: "",
  cta: { label: "Guided Planner", href: "/contact" },
  steps: [
    {
      title: "Scope",
      sla: "Day 1-2",
      deliverable: "Signed brief",
      description: "Needs workshop, headcount, zones, and bill of materials.",
    },
    {
      title: "Design",
      sla: "Day 3-7",
      deliverable: "Approved layout",
      description: "2D layout and material board submitted for sign-off.",
    },
    {
      title: "Deliver",
      sla: "Approved schedule",
      deliverable: "Installed workspace",
      description: "Factory-built, delivered, and installed to spec.",
    },
    {
      title: "Support",
      sla: "Ongoing",
      deliverable: "Service support",
      description: "Warranty coverage and dedicated after-sales contact.",
    },
  ],
} as const;

export const HOMEPAGE_SOLUTIONS_CONTENT = {
  kicker: "Workspace routes",
  title: "Browse by workspace need.",
  description: "Explore office furniture and workspace systems by category.",
  compareCta: "Compare product options",
  catalogCta: "Browse full catalog",
  mobileHint: "Swipe to browse categories",
  capabilities: [
    {
      title: "Ergonomic Seating",
      outcome:
        "Task and executive seating tuned for posture support, long-hour comfort, and dependable after-sales coverage.",
      href: "/products/seating",
      image: "/images/catalog/oando-seating--fluid-x/image-1.jpg",
    },
    {
      title: "Scalable Workstations",
      outcome:
        "Modular systems that scale team by team with practical cable management and planning-friendly layouts.",
      href: "/products/workstations",
      image: "/images/catalog/oando-workstations--deskpro/image-1.jpg",
    },
    {
      title: "Meeting Tables",
      outcome:
        "Table systems for collaboration, review, and client-facing discussion zones.",
      href: "/products/tables",
      image: "/images/products/meeting-table-10pax.webp",
    },
    {
      title: "Storage Systems",
      outcome:
        "Lockers, pedestals, and cabinets built for secure daily use with efficient footprint planning.",
      href: "/products/storages",
      image: "/images/catalog/oando-storage--metal-storages/image-1.jpg",
    },
  ],
} as const;

export const HOMEPAGE_TESTIMONIALS_CONTENT = {
  titleLead: "Client",
  titleAccent: "speak",
  items: [
    {
      quote:
        "The layout planning before production saved us significant rework. The team understood our floor constraints without us having to explain twice.",
      author: "Facilities Head",
      org: "Titan Limited, Patna",
    },
    {
      quote:
        "We needed a phased rollout across two floors with minimal downtime. The delivery and installation was coordinated well and completed on schedule.",
      author: "Admin Manager",
      org: "Government of Bihar",
    },
    {
      quote:
        "After-sales response time was faster than we expected. The warranty claim was resolved in one visit.",
      author: "Office Manager",
      org: "HDFC, Patna",
    },
  ],
} as const;

export const HOMEPAGE_FAQ_CONTENT: HomepageFaqContent = {
  titleLead: "FAQ",
  items: [
    {
      q: "Which cities do you serve?",
      a: "We are based in Patna and serve Bihar, Jharkhand, and multi-city rollout briefs across India. Delivery logistics are handled directly - no third-party intermediaries.",
    },
    {
      q: "How long does delivery and installation take?",
      a: "Scope and design is completed within 7 working days of brief sign-off. Delivery and installation timelines depend on order volume and are agreed in writing before production begins.",
    },
    {
      q: "Is installation included in the price?",
      a: "Yes. All orders include delivery to site and supervised installation by our team. Post-installation snag support is also covered.",
    },
    {
      q: "What warranty do you offer?",
      a: "Products carry manufacturer warranty (typically 2-5 years depending on the range). After-sales support is managed by our Patna team directly.",
    },
    {
      q: "Can you handle large or phased office rollouts?",
      a: "Yes. We have executed government and corporate rollouts across multiple floors and sites. Use the Guided Planner to share your brief and we will route the right next step.",
    },
  ],
} as const;

export const HOMEPAGE_PARTNERSHIP_CONTENT = {
  image: {
    src: "/catalog-logo-sharp.webp",
    alt: "AFC logo - Official Strategic Partner",
  },
  title: ["Official Strategic", "Partner"],
} as const;
