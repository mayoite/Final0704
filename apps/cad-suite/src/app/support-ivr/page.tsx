import { Hero } from "@/components/home/Hero";
import { VisualIVR } from "@/components/support/VisualIVR";
import { ContactTeaser } from "@/components/shared/ContactTeaser";
import { SUPPORT_IVR_PAGE_COPY } from "@/data/site/routeCopy";

export default function SupportPage() {
  return (
    <section className="scheme-page flex min-h-screen flex-col items-center">
      <Hero
        variant="small"
        title={SUPPORT_IVR_PAGE_COPY.heroTitle}
        subtitle={SUPPORT_IVR_PAGE_COPY.heroSubtitle}
        showButton={false}
        backgroundImage="/images/hero/hero-3.webp"
      />

      <section className="container px-6 py-18 2xl:px-0 md:py-22">
        <div className="mb-10 max-w-4xl">
          <p className="typ-label scheme-text-body mb-4">{SUPPORT_IVR_PAGE_COPY.introKicker}</p>
          <h2 className="typ-section scheme-text-strong">{SUPPORT_IVR_PAGE_COPY.introTitle}</h2>
          <p className="page-copy scheme-text-body mt-5">{SUPPORT_IVR_PAGE_COPY.introDescription}</p>
        </div>

        <div className="scheme-panel scheme-border rounded-4xl border p-6 md:p-8">
          <VisualIVR />
        </div>

        <div className="scheme-panel-soft scheme-border mt-8 rounded-2xl border p-6 md:p-8">
          <h3 className="typ-h3 scheme-text-strong">{SUPPORT_IVR_PAGE_COPY.noteTitle}</h3>
          <p className="page-copy-sm scheme-text-body mt-3">{SUPPORT_IVR_PAGE_COPY.noteDescription}</p>
        </div>
      </section>

      <ContactTeaser />
    </section>
  );
}
