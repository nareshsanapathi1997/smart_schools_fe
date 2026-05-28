"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { Section } from "@/components/shared/Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    try {
      await api.post("/cms/newsletter", { email });
      setMsg({ type: "success", text: "Subscribed successfully!" });
      setEmail("");
    } catch (err) {
      setMsg({ type: "error", text: getApiErrorMessage(err, "Subscription failed. Please try again.") });
    }
  };

  return (
    <Section variant="dark" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(245_72%_55%/0.2),transparent_70%)]" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative mx-auto max-w-xl text-center"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 text-primary"
        >
          <Mail className="h-7 w-7" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white md:text-3xl">Stay Updated</h2>
        <p className="mt-3 text-slate-400">Subscribe for news, events, and admission alerts</p>
        <form onSubmit={subscribe} className="mx-auto mt-8 flex flex-col gap-3 sm:flex-row">
          <Input
            type="email"
            required
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 flex-1 rounded-xl border-white/10 bg-white/5 text-white"
          />
          <Button type="submit" className="h-12 rounded-xl px-8">Subscribe</Button>
        </form>
        {msg && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`mt-4 text-sm ${msg.type === "success" ? "text-violet-300" : "text-red-300"}`}
          >
            {msg.text}
          </motion.p>
        )}
        <p className="mt-4 text-xs text-slate-500">
          <a href="/newsletter/unsubscribe" className="underline hover:text-slate-300">Unsubscribe</a>
        </p>
      </motion.div>
    </Section>
  );
}
