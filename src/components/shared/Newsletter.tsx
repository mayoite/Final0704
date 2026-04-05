"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Newsletter() {
    return (
        <section className="scheme-section-soft w-full py-24">
            <div className="container px-6 2xl:px-0">
                <div className="scheme-panel scheme-border relative overflow-hidden border p-12 shadow-sm group md:p-20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 transition-transform duration-1000 group-hover:scale-110" />

                    <div className="max-w-4xl relative z-10 space-y-12">
                        <div className="space-y-6">
                            <h2 className="typ-display scheme-text-heading text-4xl md:text-6xl">
                                Stay inspired. <br />
                                <span className="hero-accent scheme-text-brand">Subscribe to our newsletter.</span>
                            </h2>
                            <p className="page-copy scheme-text-body max-w-2xl">
                                Subscribe to receive updates on modern office concepts, product launches, and inspiring workspaces.
                            </p>
                        </div>

                        <form className="flex flex-col md:flex-row gap-4 max-w-2xl">
                            <input
                                type="email"
                                placeholder="Your email address"
                                className="scheme-section-soft scheme-border scheme-text-heading flex-1 border px-6 py-4 text-lg outline-none transition-colors focus:border-primary"
                                required
                            />
                            <Button
                                size="lg"
                                className="bg-inverse hover:bg-primary text-inverse px-10 h-auto py-5 uppercase tracking-widest text-sm font-bold"
                            >
                                Subscribe
                                <ArrowRight className="ml-3 w-5 h-5" />
                            </Button>
                        </form>

                        <p className="page-copy-sm scheme-text-muted max-w-xl">
                            By subscribing, you agree to our Privacy Policy. You can unsubscribe at any time. We process your data to keep you informed about our products and services.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

