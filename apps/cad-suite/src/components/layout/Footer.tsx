// Cleaned Footer — logo, nav links, address, phone, email only.
// Removed: redundant trust-badge strip (already shown in ClientLogos section above).

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Catalog_CATEGORY_ORDER, buildCatalogCategoryNav } from "@/lib/catalogCategories";
import {
  buildWhatsAppHref,
  SITE_CONTACT,
  toTelHref,
} from "@/data/site/contact";

const NAV = [
  {
    heading: "Products",
    links: [
      { href: "/products", label: "All Products" },
      ...buildCatalogCategoryNav(Catalog_CATEGORY_ORDER).map((item) => ({
        href: item.href,
        label: item.label,
      })),
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/projects", label: "Projects" },
      { href: "/sustainability", label: "Sustainability" },
      { href: "/service", label: "Service" },
      { href: "/contact", label: "Contact" },
      { href: "/login", label: "Partner Login" },
    ],
  },
];

export function Footer() {
  const whatsappHref = buildWhatsAppHref(
    `Hi, I'd like to enquire about ${SITE_CONTACT.brandName}.`,
  );

  return (
    <footer className="footer w-full bg-inverse text-subtle">
      {/* Main grid */}
      <div className="container px-6 2xl:px-0 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand + contact */}
          <div className="md:col-span-1 flex flex-col gap-6">
            <Link href="/" prefetch={false} className="block">
              <span className="text-xl font-semibold tracking-tight text-inverse">
                One&Only
              </span>
              <span className="text-xs text-muted block mt-0.5 tracking-widest uppercase">
                Furniture
              </span>
            </Link>

            <address className="not-italic text-sm leading-7 text-subtle">
              {SITE_CONTACT.regionLine}
            </address>

            <div className="text-sm space-y-1">
              <a
                href={toTelHref(SITE_CONTACT.supportPhone)}
                className="block hover:text-inverse transition-colors"
              >
                {SITE_CONTACT.supportPhone}
              </a>
              <a
                href={`mailto:${SITE_CONTACT.salesEmail}`}
                className="block hover:text-inverse transition-colors"
              >
                {SITE_CONTACT.salesEmail}
              </a>
            </div>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              className="whatsapp-cta whatsapp-cta--footer inline-flex w-fit items-center gap-2 px-4 py-2.5 text-xs font-semibold tracking-widest uppercase transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp Us
            </a>
          </div>

          {/* Nav columns */}
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-10 md:gap-16">
            {NAV.map((col) => (
              <div key={col.heading}>
                <p className="text-xs font-semibold uppercase tracking-max text-muted mb-5">
                  {col.heading}
                </p>
                <ul className="flex flex-col gap-3">
                  {col.links.map(({ href, label }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        prefetch={false}
                        className="text-sm text-subtle hover:text-inverse transition-colors"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-inverse">
        <div className="container px-6 2xl:px-0 py-5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted">
          <div className="flex gap-6">
            <Link
              href="/refund-and-return-policy"
              prefetch={false}
              className="hover:text-subtle transition-colors"
            >
              Refund Policy
            </Link>
            <Link
              href="/privacy"
              prefetch={false}
              className="hover:text-subtle transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              prefetch={false}
              className="hover:text-subtle transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/planner"
              prefetch={false}
              className="hover:text-subtle transition-colors opacity-60"
            >
              Office Planner
            </Link>
          </div>
          <div suppressHydrationWarning>
            &copy; {new Date().getFullYear()} One&Only. All rights
            reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

