"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { SCHOOL } from "@/lib/constants";

export function WhatsAppFloat() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin") || pathname.startsWith("/portal")) return null;

  return (
    <motion.a
      href={`https://wa.me/${SCHOOL.whatsapp}?text=Hello,%20I%20have%20an%20enquiry%20about%20admissions`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 260 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-24 left-4 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#25D366] text-white shadow-xl shadow-green-500/30"
      aria-label="WhatsApp support"
    >
      <motion.span
        className="absolute inset-0 rounded-2xl bg-[#25D366]"
        animate={{ scale: [1, 1.4, 1.4], opacity: [0.5, 0, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      />
      <MessageCircle className="relative h-7 w-7" />
    </motion.a>
  );
}
