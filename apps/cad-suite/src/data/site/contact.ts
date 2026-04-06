export type SiteSocialLink = {
  label: string;
  href: string;
  id: "youtube" | "facebook";
};

export const SITE_CONTACT = {
  brandName: "One&Only",
  salesPhone: "+91 98356 30940",
  supportPhone: "+91 90310 22875",
  salesEmail: "sales@oando.co.in",
  regionLine: "401 Jagat Trade Centre\nFrazer Road\nPatna 800013\nIndia",
  openingHours: "Mo-Sa 09:00-18:00",
  priceRange: "INR",
  areaServed: ["Bihar", "Jharkhand", "India"],
  address: {
    streetAddress: "401 Jagat Trade Centre, Frazer Road",
    addressLocality: "Patna",
    postalCode: "800013",
    addressRegion: "Bihar",
    addressCountry: "IN",
  },
  geo: {
    latitude: 25.6127,
    longitude: 85.1376,
  },
  socialLinks: [
    {
      label: "YouTube",
      href: "https://www.youtube.com/channel/UCehXuPNAXkyfODPCwyAU1gQ",
      id: "youtube",
    },
    {
      label: "Facebook",
      href: "https://www.facebook.com/oandofurniture",
      id: "facebook",
    },
  ] satisfies SiteSocialLink[],
} as const;

export const SUPPORT_PHONE_DIGITS = "919031022875";
export const SALES_PHONE_DIGITS = "919835630940";

export function toTelHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function buildMailtoHref(subject?: string, body?: string) {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);

  const query = params.toString();
  return query
    ? `mailto:${SITE_CONTACT.salesEmail}?${query}`
    : `mailto:${SITE_CONTACT.salesEmail}`;
}

export function buildWhatsAppHref(message: string, phoneDigits = SUPPORT_PHONE_DIGITS) {
  return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;
}
