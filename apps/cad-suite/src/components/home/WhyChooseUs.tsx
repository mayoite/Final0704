"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Zap, Leaf, Activity } from "lucide-react";
import { useInViewOnce } from "@/hooks/useInViewOnce";

const features = [
  {
    icon: Activity,
    title: "Performance-Graded Components",
    description:
      "Every system is selected for sustained enterprise use, with attention to load, cycle, and ergonomic performance.",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise-Grade Durability",
    description:
      "Built for institutions that demand reliability. BIFMA-compliant structures with a 5-year performance warranty.",
  },
  {
    icon: Leaf,
    title: "Sustainable Engineering",
    description:
      "Low-emission materials, recycled substrates, and responsible supply chains support a longer-life workspace strategy.",
  },
  {
    icon: Zap,
    title: "Scalable System Design",
    description:
      "Modular by design, so teams can scale from pilot zones to large rollouts without rebuilding the whole specification.",
  },
] as const;

export function WhyChooseUs() {
  const { ref, isVisible } = useInViewOnce();

  return (
    <section className="scheme-section-soft scheme-border w-full border-y py-18 md:py-22">
      <div className="container px-6 2xl:px-0">
        <div
          ref={ref}
          className={`mb-12 max-w-3xl reveal-on-scroll ${isVisible ? "visible" : ""}`}
        >
          <h2 className="typ-section-title">
            We engineer workspace systems,{" "}
            <span className="text-primary italic">not just furniture.</span>
          </h2>
          <p className="typ-section-subtitle max-w-2xl">
            We build planning-led furniture systems that improve usability, durability, and rollout
            confidence for corporate, government, and institutional teams across Bihar and beyond.
          </p>

          <ul className="mt-8 flex flex-wrap gap-4">
            {[
              "Performance-graded components",
              "Enterprise-grade durability",
              "Sustainable engineering",
            ].map((bullet) => (
              <li
                key={bullet}
                className="scheme-panel scheme-border scheme-text-body flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {bullet}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="scheme-panel scheme-border group rounded-xl border p-8 transition-colors hover:border-strong"
            >
              <div className="mb-6 text-strong transition-colors group-hover:text-primary">
                <feature.icon className="h-8 w-8" strokeWidth={1} />
              </div>
              <h3 className="mb-3 text-xl font-medium tracking-tight text-strong">
                {feature.title}
              </h3>
              <p className="page-copy-sm scheme-text-body">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
