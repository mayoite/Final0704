"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { HOMEPAGE_PROJECTS_CONTENT } from "@/data/site/homepage";
import { fadeUp, staggerContainer, staggerItem } from "@/lib/helpers/motion";

export function Projects() {
  const layouts = ["primary", "secondary", "tertiary", "quaternary"] as const;

  return (
    <section className="projects-section">
      <div className="projects-section__shell">
        <motion.div className="projects-section__header" {...fadeUp(14, 0.03)}>
          <div className="max-w-3xl">
            <h2 className="home-heading">
              {HOMEPAGE_PROJECTS_CONTENT.titleLead}{" "}
              <span className="home-heading__accent">
                {HOMEPAGE_PROJECTS_CONTENT.titleAccent}
              </span>
            </h2>
          </div>
          <Link
            href={HOMEPAGE_PROJECTS_CONTENT.cta.href}
            className="projects-section__cta group"
          >
            {HOMEPAGE_PROJECTS_CONTENT.cta.label}
            <ArrowRight className="h-4 w-4 transform transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        <motion.div
          className="projects-grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.16 }}
        >
          {HOMEPAGE_PROJECTS_CONTENT.cards.map((project, index) => (
            <motion.div
              key={project.companyName}
              variants={staggerItem}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.22 }}
              className={`projects-card projects-card--${layouts[index] ?? "quaternary"} group`}
            >
              <div className="projects-card__media relative">
                <Image
                  src={project.image}
                  alt={project.companyName}
                  fill
                  priority
                  loading="eager"
                  className="projects-card__image"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="projects-card__body">
                <span className="block text-xs font-medium uppercase tracking-ultra text-muted">
                  {project.sector}
                </span>
                <h3 className="projects-card__title">{project.companyName}</h3>
                <p className="max-w-[34ch] text-sm leading-relaxed text-muted">
                  {project.outcome}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
