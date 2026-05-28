"use client";

import { useState } from "react";
import { PageHero } from "@/components/shared/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlowCard } from "@/components/motion/AnimatedSection";
import { PLACEHOLDER } from "@/lib/images";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";

export default function NewsletterUnsubscribePage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setError("");
    try {
      await api.post("/cms/newsletter/unsubscribe", { email });
      setMsg("You have been unsubscribed from our newsletter.");
      setEmail("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Unsubscribe failed. Email may not be on our list."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHero title="Unsubscribe" subtitle="Remove your email from our newsletter" backgroundImage={PLACEHOLDER.legal} breadcrumbs={[{ label: "Newsletter Unsubscribe" }]} />
      <section className="container mx-auto max-w-lg px-4 py-16 lg:px-8">
        <GlowCard className="p-8">
          <form onSubmit={submit} className="space-y-4">
            <Input type="email" className="rounded-xl" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            {msg && <p className="text-sm text-emerald-600">{msg}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full rounded-xl" disabled={loading}>
              {loading ? "Processing..." : "Unsubscribe"}
            </Button>
          </form>
        </GlowCard>
      </section>
    </>
  );
}
