"use client";

import { motion } from "framer-motion";

interface StatItem {
    value: string;
    label: string;
}

interface StatsSectionProps {
    title: string;
    subtitle?: string;
    stats: StatItem[];
}

export function StatsSection({ title, subtitle, stats }: StatsSectionProps) {
    return (
        <section className="w-full py-24 bg-inverse text-inverse overflow-hidden">
            <div className="container px-6 2xl:px-0">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 mb-20">
                    <div className="max-w-2xl space-y-6">
                        <h2 className="text-3xl md:text-4xl tracking-tight leading-tight">
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="scheme-text-inverse-body text-xl font-light leading-relaxed">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-16">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.8 }}
                            className="space-y-4"
                        >
                            <div className="text-5xl md:text-7xl font-extralight tracking-tighter text-primary">
                                {stat.value}
                            </div>
                            <div className="h-px w-12 bg-inverse-soft" />
                            <div className="scheme-text-inverse-muted text-sm uppercase tracking-max font-medium">
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}



