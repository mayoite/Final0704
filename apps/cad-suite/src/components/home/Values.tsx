"use client";

import { motion } from "framer-motion";

const VALUES = [
    {
        title: "Quality",
        description: "Made for India. Durable materials and precise craftsmanship for long-lasting office solutions.",
    },
    {
        title: "Innovation",
        description: "Future-oriented concepts that adapt to changing work environments and individual needs.",
    },
    {
        title: "Design",
        description: "Clear lines, functional aesthetics, and a timeless visual language that enhances any space.",
    },
];

export function Values() {
    return (
        <section className="w-full bg-panel py-24 md:py-32">
            <div className="container px-6 2xl:px-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                    {VALUES.map((value, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.2 }}
                            className="flex flex-col gap-4 group"
                        >
                            <h3 className="text-3xl font-light text-strong border-l-2 border-primary pl-4 group-hover:pl-6 transition-all duration-300">
                                {value.title}
                            </h3>
                            <p className="text-lg font-light text-muted leading-relaxed pl-4">
                                {value.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

