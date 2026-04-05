"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 bg-inverse text-inverse border-t border-strong">
      <div className="container mx-auto px-6 lg:px-12 text-center">
        <h2 className="text-4xl md:text-5xl font-light mb-6">
          Ready to <span className="italic scheme-text-inverse-muted">Transform</span> Your Space?
        </h2>
        <p className="scheme-text-inverse-body max-w-2xl mx-auto mb-10 text-lg">
          Connect with our design experts today to discuss your project requirements.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-8 py-4 bg-panel text-strong font-medium tracking-widest uppercase hover:bg-hover transition-colors"
        >
          Start Your Project
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}


