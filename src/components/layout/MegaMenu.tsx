"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface MenuItem {
  label: string;
  href: string;
}

interface CardItem {
  title: string;
  description: string;
  image: string;
  href: string;
}

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: MenuItem[];
  cards: CardItem[];
}

export function MegaMenu({ isOpen, items, cards, onClose }: MegaMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="absolute top-full left-0 w-full bg-panel shadow-lg border-t border-soft z-[998]"
          onMouseLeave={onClose}
        >
          <div className="container px-6 2xl:px-0 py-10">
            <div className="flex gap-12">
              {/* Left Column: Link List */}
              <div className="w-1/4 pt-2">
                <ul className="flex flex-col gap-3">
                  {items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        prefetch={false}
                        className="text-[15px] font-normal text-strong hover:text-primary transition-colors block"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right Column: Cards Grid */}
              <div className="w-3/4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cards.map((card) => (
                    <Link
                      key={card.title}
                      href={card.href}
                      prefetch={false}
                      className="group block"
                    >
                      <div className="relative aspect-[16/9] bg-hover mb-3 overflow-hidden">
                        {card.image && (
                          <Image
                            src={card.image}
                            alt={card.title}
                            fill
                            sizes="(max-width: 1024px) 100vw, 25vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        )}
                        <div className="absolute inset-0 bg-[color:transparent] group-hover:bg-[color:var(--overlay-inverse-06)] transition-colors" />
                      </div>
                      <h3 className="text-base font-bold text-strong group-hover:text-primary transition-colors mb-1">
                        {card.title}
                      </h3>
                      <p className="text-sm text-muted font-light">
                        {card.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}



