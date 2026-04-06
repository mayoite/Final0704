"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { BusinessStats } from "@/lib/types/businessStats";
import { formatKpiValuePlus } from "@/lib/kpiFormat";

interface StatsBlockProps {
  stats: BusinessStats;
  asOfLabel: string;
}

function StatItem({
  id,
  value,
  label,
  index,
}: {
  id: string;
  value: string;
  label: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      className="flex flex-col items-center md:items-start"
    >
      <div
        data-testid={`kpi-${id}`}
        className="text-5xl md:text-6xl font-light text-strong tracking-tight tabular-nums"
      >
        {value}
      </div>
      <div className="mt-2 text-xs text-muted font-semibold tracking-[0.15em] uppercase">
        {label}
      </div>
    </motion.div>
  );
}

export function StatsBlock({ stats, asOfLabel }: StatsBlockProps) {
  const rows = [
    { id: "years-experience", value: formatKpiValuePlus(stats.yearsExperience), label: "Years of Excellence" },
    { id: "projects-delivered", value: formatKpiValuePlus(stats.projectsDelivered), label: "Projects Delivered" },
    { id: "client-organisations", value: formatKpiValuePlus(stats.clientOrganisations), label: "Corporate Clients" },
    { id: "locations-served", value: formatKpiValuePlus(stats.locationsServed), label: "Locations Served" },
  ];

  return (
    <section className="w-full bg-hover border-y border-soft py-20 md:py-28">
      <div className="container px-6 2xl:px-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
          {rows.map((stat, i) => (
            <StatItem key={stat.id} id={stat.id} value={stat.value} label={stat.label} index={i} />
          ))}
        </div>
        <p data-testid="kpi-as-of-home" className="mt-8 text-center text-xs font-medium text-muted tracking-wide">
          {asOfLabel}
        </p>
      </div>
    </section>
  );
}
