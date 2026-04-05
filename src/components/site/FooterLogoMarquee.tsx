import Image from "next/image";
import { HOMEPAGE_TRUST_CONTENT } from "@/data/site/homepage";

export function FooterLogoMarquee() {
  const trackLogos = [...HOMEPAGE_TRUST_CONTENT.logos, ...HOMEPAGE_TRUST_CONTENT.logos];

  return (
    <section
      aria-hidden="true"
      className="footer-logo-marquee w-full border-y border-soft bg-panel py-4 md:py-5"
      style={{ ["--marquee-duration" as string]: "110s" }}
    >
      <div className="relative overflow-hidden">
        <div className="footer-logo-marquee__track">
          {trackLogos.map((logo, index) => (
            <div
              key={`${logo.name}-${index}`}
              className="footer-logo-marquee__item flex h-12 w-34 shrink-0 items-center justify-center md:h-16 md:w-44"
            >
              {logo.src ? (
                <Image
                  src={logo.src}
                  alt={logo.name}
                  width={208}
                  height={72}
                  className="h-10 w-auto object-contain opacity-100 saturate-100 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-150 motion-reduce:hover:scale-100 md:h-12"
                />
              ) : (
                <span className="rounded-full border border-soft px-4 py-2 text-sm font-semibold tracking-[0.12em] uppercase text-muted">
                  {logo.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
