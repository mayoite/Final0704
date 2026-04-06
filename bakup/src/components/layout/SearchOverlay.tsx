"use client";

import { X, Search, ArrowRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type SearchOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SUGGESTIONS = [
  "WINEA PRO Desk",
  "Acoustic Panels",
  "Meeting Tables",
  "Ergonomics Guide",
  "Showrooms",
];

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const focusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [query, setQuery] = useState("");

  // Focus input when opened
  useEffect(() => {
    if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);
    if (isOpen) {
      focusTimeoutRef.current = setTimeout(() => inputRef.current?.focus(), 100);
    }
    return () => {
      if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 surface-overlay-95 backdrop-blur-sm z-60 flex flex-col items-center justify-start pt-32 px-6"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            title="Close Search"
            className="absolute top-8 right-8 p-2 hover:bg-hover rounded-full transition-colors"
          >
            <X className="w-8 h-8 text-subtle hover:text-strong" />
          </button>

          {/* Search Input */}
          <div className="w-full max-w-3xl relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products, solutions..."
              className="w-full text-4xl md:text-5xl font-light text-strong placeholder:text-subtle bg-transparent border-b-2 border-soft focus:border-primary outline-none py-4 pr-12 transition-colors"
            />
            <Search className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 text-subtle" />
          </div>

          {/* Results / Suggestions */}
          <div className="w-full max-w-3xl mt-12 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-sm font-medium uppercase tracking-wide text-subtle mb-6">
                Popular Searches
              </h3>
              <ul className="space-y-4">
                {SUGGESTIONS.map((item) => (
                  <li key={item}>
                    <button className="text-lg md:text-xl font-light text-muted hover:text-primary transition-colors flex items-center gap-2 group">
                      <ArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {query && (
              <div>
                <h3 className="text-sm font-medium uppercase tracking-wide text-subtle mb-6">
                  Results
                </h3>
                <div className="p-4 bg-hover border border-soft text-muted italic">
                  Showing results for &quot;{query}&quot;...
                  <br />
                  <span className="text-xs not-italic text-subtle">
                    (This is a simulated search interface)
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

