"use client";

import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { buildWhatsAppHref, SUPPORT_PHONE_DIGITS } from "@/data/site/contact";

export function WhatsAppBot() {
  const openWhatsApp = () => {
    const href = buildWhatsAppHref(
      "Hi, I'm interested in One&Only solutions. Please assist me with my inquiry.",
      SUPPORT_PHONE_DIGITS,
    );
    window.open(href, "_blank");
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={openWhatsApp}
      className="whatsapp-cta fixed bottom-6 right-6 z-1050 flex h-14 w-14 items-center justify-center rounded-full text-inverse shadow-lg transition-colors"
      title="Chat with us on WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </motion.button>
  );
}

