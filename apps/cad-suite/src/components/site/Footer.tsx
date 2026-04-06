import Link from "next/link";
import { OneAndOnlyLogo } from "@/components/ui/Logo";
import {
  buildMailtoHref,
  SITE_CONTACT,
  toTelHref,
} from "@/data/site/contact";
import { SITE_FOOTER_NAV, SITE_SOCIAL_LINKS } from "@/lib/siteNav";

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M20.447 20.452H16.89v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a1.974 1.974 0 1 1 0-3.948 1.974 1.974 0 0 1 0 3.948zm1.707 13.019H3.63V9h3.414v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M23.5 6.2a3.1 3.1 0 0 0-2.2-2.2C19.4 3.5 12 3.5 12 3.5s-7.4 0-9.3.5A3.1 3.1 0 0 0 .5 6.2 32 32 0 0 0 0 12a32 32 0 0 0 .5 5.8 3.1 3.1 0 0 0 2.2 2.2c1.9.5 9.3.5 9.3.5s7.4 0 9.3-.5a3.1 3.1 0 0 0 2.2-2.2A32 32 0 0 0 24 12a32 32 0 0 0-.5-5.8zM9.6 15.5V8.5L15.8 12 9.6 15.5z" />
    </svg>
  );
}

const SOCIAL_ICON_MAP: Record<string, () => React.JSX.Element> = {
  linkedin: LinkedInIcon,
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  youtube: YouTubeIcon,
};
const footerInteractiveClass =
  "rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer w-full">
      <div className="container px-6 py-12 2xl:px-0 md:py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-5 md:gap-7">
          <div className="flex flex-col gap-5 md:col-span-1">
            <Link href="/" prefetch={false} className={`site-footer__link ${footerInteractiveClass} block`}>
              <OneAndOnlyLogo variant="orange" className="h-10" />
            </Link>

            <address className="site-footer__address typ-body-sm whitespace-pre-line not-italic">
              {SITE_CONTACT.regionLine}
            </address>

            <div className="site-footer__meta typ-body-sm space-y-4">
              <div>
                <p className="site-footer__heading typ-overline mb-1">Sales and support</p>
                <div className="flex flex-col gap-1">
                  <a href={toTelHref(SITE_CONTACT.salesPhone)} className={`site-footer__link ${footerInteractiveClass} block`}>
                    Sales: {SITE_CONTACT.salesPhone}
                  </a>
                  <a href={toTelHref(SITE_CONTACT.supportPhone)} className={`site-footer__link ${footerInteractiveClass} block`}>
                    Support: {SITE_CONTACT.supportPhone}
                  </a>
                </div>
              </div>
              <div>
                <p className="site-footer__heading typ-overline mb-1">Email</p>
                <a href={buildMailtoHref()} className={`site-footer__link ${footerInteractiveClass} block`}>
                  {SITE_CONTACT.salesEmail}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-0.5">
              {SITE_SOCIAL_LINKS.map((social) => {
                const Icon = SOCIAL_ICON_MAP[social.id];
                return (
                  <a
                    key={social.id}
                    href={social.href}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`site-footer__social ${footerInteractiveClass}`}
                  >
                    {Icon ? <Icon /> : null}
                  </a>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-7 sm:grid-cols-4 md:col-span-4 md:gap-5">
            {SITE_FOOTER_NAV.map((col) => (
              <div key={col.heading}>
                <p className="site-footer__heading typ-overline mb-3">{col.heading}</p>
                <ul className="flex flex-col gap-2">
                  {col.links.map(({ href, label }) => (
                    <li key={`${href}-${label}`}>
                      <Link href={href} prefetch={false} className={`site-footer__link ${footerInteractiveClass} typ-body-sm`}>
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

      <div className="site-footer__divider mt-2 border-t">
        <div className="site-footer__legal-row typ-body-sm container flex flex-col items-center justify-between gap-3 px-6 py-5 sm:flex-row 2xl:px-0">
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:justify-start">
            <Link href="/refund-and-return-policy" prefetch={false} className={`site-footer__legal ${footerInteractiveClass}`}>
              Refund Policy
            </Link>
            <Link href="/privacy" prefetch={false} className={`site-footer__legal ${footerInteractiveClass}`}>
              Privacy Policy
            </Link>
            <Link href="/terms" prefetch={false} className={`site-footer__legal ${footerInteractiveClass}`}>
              Terms
            </Link>
          </div>
          <div>&copy; {currentYear} One&Only. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}
