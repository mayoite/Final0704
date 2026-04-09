"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Info, Phone, User } from "lucide-react";

import { toTelHref } from "@/data/site/contact";
import { VISUAL_IVR_TREE, type VisualIvrNode } from "@/data/site/support";

function resolveNodeIcon(node: VisualIvrNode) {
  switch (node.icon) {
    case "user":
      return <User className="h-6 w-6" />;
    case "phone":
      return <Phone className="h-6 w-6" />;
    case "info":
      return <Info className="h-6 w-6" />;
    default:
      return <ArrowRight className="h-5 w-5" />;
  }
}

function isEmail(value: string) {
  return value.includes("@");
}

function getActionHref(node: VisualIvrNode) {
  if (!node.action) return null;

  if (node.action.type === "link") {
    return node.action.value;
  }

  if (node.action.type === "contact") {
    return isEmail(node.action.value) ? `mailto:${node.action.value}` : toTelHref(node.action.value);
  }

  return null;
}

export function VisualIVR() {
  const [path, setPath] = useState<VisualIvrNode[]>([VISUAL_IVR_TREE]);
  const currentNode = path[path.length - 1];
  const actionHref = useMemo(() => getActionHref(currentNode), [currentNode]);
  const actionLabel = useMemo(() => {
    if (!currentNode.action) return null;
    if (currentNode.action.type === "link") return "Open Page";
    if (isEmail(currentNode.action.value)) return "Send Email";
    return "Call Now";
  }, [currentNode]);

  const handleSelect = (node: VisualIvrNode) => {
    setPath((currentPath) => [...currentPath, node]);
  };

  const handleBack = () => {
    setPath((currentPath) => (currentPath.length > 1 ? currentPath.slice(0, -1) : currentPath));
  };

  const handleReset = () => {
    setPath([VISUAL_IVR_TREE]);
  };

  return (
    <div className="mx-auto min-h-[500px] w-full max-w-4xl rounded-none border border-soft bg-hover p-8 shadow-sm md:p-12">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted">
          {path.length > 1 && (
            <button onClick={handleBack} className="flex items-center gap-1 transition-colors hover:text-primary">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          )}
          {path.length > 1 && <span className="text-subtle">|</span>}
          <div className="flex items-center gap-2">
            {path.map((node, index) => (
              <span key={node.id} className={index === path.length - 1 ? "font-semibold text-strong" : ""}>
                {node.label}
                {index < path.length - 1 && <span className="mx-1 text-subtle">/</span>}
              </span>
            ))}
          </div>
        </div>

        {path.length > 1 && (
          <button
            onClick={handleReset}
            className="text-xs uppercase tracking-wider text-subtle transition-colors hover:text-primary"
          >
            Start Over
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentNode.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <h2 className="mb-2 text-3xl font-light text-strong md:text-4xl">{currentNode.label}</h2>
          <p className="mb-10 text-lg font-light text-muted">
            {currentNode.description || "Please select an option below."}
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {currentNode.options?.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelect(option)}
                className="group flex items-start gap-4 border border-soft bg-panel p-6 text-left transition-all duration-300 hover:border-primary hover:shadow-md"
              >
                <div className="bg-hover p-3 transition-colors group-hover:bg-primary group-hover:text-inverse">
                  {resolveNodeIcon(option)}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-strong transition-colors group-hover:text-primary">
                    {option.label}
                  </h3>
                  {option.description && <p className="mt-1 text-sm font-light text-muted">{option.description}</p>}
                </div>
              </button>
            ))}

            {currentNode.action && (
              <div className="col-span-full border-l-4 border-primary bg-panel p-8 shadow-sm">
                <div className="flex flex-col items-center space-y-4 text-center">
                  {currentNode.action.type === "contact" && <Phone className="h-12 w-12 stroke-1 text-primary" />}
                  {currentNode.action.type === "link" && <ArrowRight className="h-12 w-12 stroke-1 text-primary" />}
                  {currentNode.action.type === "info" && <Info className="h-12 w-12 stroke-1 text-primary" />}

                  <h3 className="text-2xl font-medium text-strong">{currentNode.action.value}</h3>

                  {currentNode.action.detail && (
                    <p className="text-lg font-light text-muted">{currentNode.action.detail}</p>
                  )}

                  {actionHref && actionLabel && (
                    <a
                      href={actionHref}
                      className="mt-4 inline-block bg-inverse px-8 py-3 text-inverse transition-colors hover:bg-inverse-soft"
                    >
                      {actionLabel}
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
