"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Mail, MessageCircle, Phone, X } from "lucide-react";
import { hasConsentChoice } from "@/lib/consent";
import { buildMailtoHref, buildWhatsAppHref, SITE_CONTACT, toTelHref } from "@/data/site/contact";
import { routeSuppressesFloatingQuickContact } from "@/lib/contactSurfaces";

export function WhatsAppCTA() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const consentSettled = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") return () => {};
      const handler = () => onStoreChange();
      window.addEventListener("oando-cookie-consent", handler as EventListener);
      return () => window.removeEventListener("oando-cookie-consent", handler as EventListener);
    },
    () => hasConsentChoice(),
    () => false,
  );

  if (!isHydrated || routeSuppressesFloatingQuickContact(pathname)) return null;

  const buttonOffset = consentSettled ? "bottom-4 sm:bottom-5" : "bottom-36 sm:bottom-5";
  const panelOffset = consentSettled ? "bottom-20 sm:bottom-20" : "bottom-52 sm:bottom-20";
  const whatsappHref = buildWhatsAppHref("Hi, I need help with my workspace requirement.");
  const quickActions = [
    {
      href: whatsappHref,
      label: "WhatsApp now",
      detail: "Fastest response",
      icon: MessageCircle,
      external: true,
    },
    {
      href: toTelHref(SITE_CONTACT.supportPhone),
      label: "Call team",
      detail: "Talk to support",
      icon: Phone,
      external: false,
    },
    {
      href: buildMailtoHref("Workspace enquiry"),
      label: "Email us",
      detail: "Send the brief",
      icon: Mail,
      external: false,
    },
  ] as const;
  const actionClass =
    "group flex items-center gap-3 rounded-[var(--radius-lg)] border border-[color:var(--overlay-inverse-06)] bg-[color:var(--overlay-panel-72)] px-4 py-3 shadow-[0_10px_24px_-28px_var(--overlay-inverse-24)] transition-[transform,border-color,background-color,box-shadow] duration-[var(--motion-base)] ease-[var(--ease-standard)] hover:-translate-y-0.5 hover:border-(--color-primary) hover:bg-panel hover:shadow-theme-soft";

  return (
    <>
      <motion.button
        type="button"
        aria-label="Open WhatsApp quick contact"
        onClick={() => setOpen((prev) => !prev)}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.25 }}
        whileTap={{ scale: 0.96 }}
        className={`fixed right-3 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full border border-(--color-primary) bg-(--color-primary) text-inverse shadow-[0_24px_48px_-28px_var(--overlay-inverse-35)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-(--color-primary-hover) hover:shadow-[0_30px_54px_-28px_var(--overlay-inverse-35)] sm:right-5 ${buttonOffset}`}
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className={`fixed right-3 z-40 w-[19rem] rounded-xl border p-4 [background-color:var(--surface-panel)] [border-color:var(--border-soft)] [box-shadow:var(--shadow-panel)] sm:right-5 ${panelOffset}`}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-strong">Quick contact</p>
                <p className="text-xs text-body">Reach the team directly.</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close WhatsApp quick contact"
                className="rounded-full bg-hover p-1.5 text-body transition-colors hover:bg-hover"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <a
                    key={action.label}
                    href={action.href}
                    target={action.external ? "_blank" : undefined}
                    rel={action.external ? "noopener noreferrer" : undefined}
                    className={actionClass}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--surface-accent-wash)] text-(--color-primary)">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="typ-body-sm font-medium leading-[1.25] tracking-[var(--type-letter-copy)] text-(--text-strong)">
                        {action.label}
                      </span>
                      <span className="mt-1 typ-body-sm leading-[1.4] text-(--text-muted)">
                        {action.detail}
                      </span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-(--color-primary) transition-transform duration-fast ease-[var(--ease-standard)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                );
              })}

              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full px-3 py-2 text-sm font-medium text-primary transition-colors hover:text-primary-hover"
                onClick={() => setOpen(false)}
              >
                Open full contact page
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}


