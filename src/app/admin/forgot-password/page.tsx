"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";

export default function ForgotPasswordPage() {
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
      await api.post("/auth/forgot-password", { email });
      setMsg("If that email exists, a reset link has been sent.");
    } catch {
      setError("Request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="absolute inset-0 bg-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(245_72%_55%/0.25),transparent_50%)]" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-2xl"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-white">Forgot Password</h1>
          <p className="mt-1 text-sm text-slate-400">We will email you a reset link</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Input
            type="email"
            placeholder="Admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500"
          />
          {msg && <p className="text-sm text-emerald-400">{msg}</p>}
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" className="h-12 w-full rounded-xl" disabled={loading}>
            <Mail className="h-4 w-4" /> {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">
          <Link href="/admin/login" className="text-violet-400 hover:underline">Back to login</Link>
        </p>
      </motion.div>
    </div>
  );
}
