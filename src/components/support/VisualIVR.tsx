"use client";

import React from "react";

import { useState } from "react";
import { ArrowRight, ArrowLeft, Phone, User, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type IVRNode = {
    id: string;
    label: string;
    icon?: React.ReactNode;
    description?: string;
    options?: IVRNode[];
    action?: {
        type: "contact" | "info" | "link";
        value: string;
        detail?: string;
    };
};

const IVR_TREE: IVRNode = {
    id: "root",
    label: "Main Menu",
    options: [
        {
            id: "sales",
            label: "Sales & Product Requests",
            icon: <User className="w-6 h-6" />,
            description: "Request a quote or product information",
            options: [
                {
                    id: "sales_de",
                    label: "Domestic (India)",
                    action: { type: "contact", value: "+91 124 403 1666", detail: "sales@oando.co.in" }
                },
                {
                    id: "sales_int",
                    label: "International Sales",
                    action: { type: "contact", value: "+91 124 403 1666", detail: "export@oando.co.in" }
                },
                {
                    id: "dealer",
                    label: "Find a Dealer",
                    action: { type: "link", value: "/contact", detail: "Use our Dealer Locator" }
                }
            ]
        },
        {
            id: "support",
            label: "Customer Support",
            icon: <Phone className="w-6 h-6" />,
            description: "Help with existing orders or products",
            options: [
                {
                    id: "order_status",
                    label: "Order Status",
                    action: { type: "info", value: "Please have your order confirmation number ready." }
                },
                {
                    id: "claims",
                    label: "Complaints & Claims",
                    action: { type: "contact", value: "service@oando.co.in", detail: "Attach photos for faster processing" }
                },
                {
                    id: "spare_parts",
                    label: "Spare Parts",
                    action: { type: "link", value: "/products", detail: "Check product manuals first" }
                }
            ]
        },
        {
            id: "general",
            label: "General Inquiry",
            icon: <Info className="w-6 h-6" />,
            description: "Reception, HR, and other topics",
            options: [
                {
                    id: "reception",
                    label: "Reception / Switchboard",
                    action: { type: "contact", value: "+91 124 403 1666", detail: "Mon-Sat 9:30 - 18:30 IST" }
                },
                {
                    id: "hr",
                    label: "Human Resources / Careers",
                    action: { type: "link", value: "/career", detail: "View open positions" }
                },
                {
                    id: "press",
                    label: "Press & Marketing",
                    action: { type: "contact", value: "marketing@oando.co.in" }
                }
            ]
        }
    ]
};

export function VisualIVR() {
    const [path, setPath] = useState<IVRNode[]>([IVR_TREE]);
    const currentNode = path[path.length - 1];

    const handleSelect = (node: IVRNode) => {
        setPath([...path, node]);
    };

    const handleBack = () => {
        if (path.length > 1) {
            setPath(path.slice(0, -1));
        }
    };

    const handleReset = () => {
        setPath([IVR_TREE]);
    };

    return (
        <div className="w-full max-w-4xl mx-auto min-h-[500px] bg-hover border border-soft p-8 md:p-12 shadow-sm rounded-none">
            {/* Header / Breadcrumbs */}
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted">
                    {path.length > 1 && (
                        <button onClick={handleBack} className="flex items-center gap-1 hover:text-primary transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                    )}
                    {path.length > 1 && <span className="text-subtle">|</span>}
                    <div className="flex items-center gap-2">
                        {path.map((node, idx) => (
                            <span key={node.id} className={idx === path.length - 1 ? "font-semibold text-strong" : ""}>
                                {node.label} {(idx < path.length - 1) && <span className="text-subtle mx-1">/</span>}
                            </span>
                        ))}
                    </div>
                </div>
                {path.length > 1 && (
                    <button onClick={handleReset} className="text-xs uppercase tracking-wider text-subtle hover:text-primary transition-colors">
                        Start Over
                    </button>
                )}
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentNode.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    <h2 className="text-3xl md:text-4xl font-light mb-2 text-strong">{currentNode.label}</h2>
                    <p className="text-lg text-muted font-light mb-10">{currentNode.description || "Please select an option below:"}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Recursive Options */}
                        {currentNode.options?.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => handleSelect(option)}
                                className="group text-left p-6 bg-panel border border-soft hover:border-primary hover:shadow-md transition-all duration-300 flex items-start gap-4"
                            >
                                <div className={`p-3 bg-hover group-hover:bg-primary group-hover:text-inverse transition-colors`}>
                                    {option.icon || <ArrowRight className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h3 className="font-medium text-lg text-strong group-hover:text-primary transition-colors">
                                        {option.label}
                                    </h3>
                                    {option.description && (
                                        <p className="text-sm text-muted font-light mt-1">
                                            {option.description}
                                        </p>
                                    )}
                                </div>
                            </button>
                        ))}

                        {/* Terminal Action / Result */}
                        {currentNode.action && (
                            <div className="col-span-full bg-panel border-l-4 border-primary p-8 shadow-sm">
                                <div className="flex flex-col items-center text-center space-y-4">
                                    {currentNode.action.type === 'contact' && <Phone className="w-12 h-12 text-primary stroke-1" />}
                                    {currentNode.action.type === 'link' && <ArrowRight className="w-12 h-12 text-primary stroke-1" />}
                                    {currentNode.action.type === 'info' && <Info className="w-12 h-12 text-primary stroke-1" />}

                                    <h3 className="text-2xl font-medium text-strong">
                                        {currentNode.action.value}
                                    </h3>
                                    {currentNode.action.detail && (
                                        <p className="text-muted font-light text-lg">
                                            {currentNode.action.detail}
                                        </p>
                                    )}

                                    {currentNode.action.type === 'link' && (
                                        <a href={currentNode.action.value} className="inline-block mt-4 px-8 py-3 bg-inverse text-inverse hover:bg-inverse-soft transition-colors">
                                            Go to Page
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}


