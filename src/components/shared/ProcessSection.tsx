"use client";

import { motion } from "framer-motion";
import { Search, PenTool, Layout, Truck, CheckCircle } from "lucide-react";

const STEPS = [
    {
        icon: Search,
        title: "Analysis",
        description: "We analyze your requirements and current office situation to find the perfect starting point."
    },
    {
        icon: PenTool,
        title: "Planning",
        description: "Our experts create individual 3D planning and holistic furnishing concepts."
    },
    {
        icon: Layout,
        title: "Product Selection",
        description: "Choose from our wide range of modular furniture systems and custom solutions."
    },
    {
        icon: Truck,
        title: "Realization",
        description: "Punctual delivery and professional assembly by our experienced service team."
    },
    {
        icon: CheckCircle,
        title: "After-Sales",
        description: "Long-term support and maintenance to ensure your office stays perfect over time."
    }
];

export function ProcessSection() {
    return (
        <section className="w-full py-24 bg-hover">
            <div className="container px-6 2xl:px-0">
                <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
                    <h2 className="text-3xl md:text-4xl text-strong tracking-tight">
                        Our Way to Your <span className="text-primary italic">Perfect Office.</span>
                    </h2>
                    <p className="text-xl text-muted font-light">
                        From the first idea to the finished workspace - we accompany you in every step of the process.
                    </p>
                </div>

                <div className="relative">
                    {/* Connection Line (Desktop) */}
                    <div className="hidden lg:block absolute top-1/2 left-0 w-full h-px bg-soft -translate-y-1/2" />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
                        {STEPS.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                className="relative flex flex-col items-center text-center space-y-6 bg-panel lg:bg-transparent p-8 lg:p-0 border border-soft lg:border-none shadow-sm lg:shadow-none"
                            >
                                <div className="relative z-10 w-16 h-16 rounded-full bg-panel border-2 border-primary flex items-center justify-center text-primary shadow-lg transition-transform hover:scale-110 duration-300">
                                    <step.icon className="w-8 h-8" />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-xl font-medium text-strong">
                                        {index + 1}. {step.title}
                                    </h3>
                                    <p className="text-muted font-light text-sm leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

