"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { GraduationCap, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";

export default function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/reset-password", { token, password });
      router.push("/admin/login?reset=1");
    } catch {
      setError("Invalid or expired reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="absolute inset-0 bg-slate-950" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-2xl"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
        </div>
        {!token ? (
          <p className="text-center text-sm text-red-400">Missing reset token. Request a new link.</p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <Input type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500" />
            <Input type="password" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8} className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500" />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" className="h-12 w-full rounded-xl" disabled={loading}>
              <Lock className="h-4 w-4" /> {loading ? "Saving..." : "Reset Password"}
            </Button>
          </form>
        )}
        <p className="mt-6 text-center text-sm text-slate-400">
          <Link href="/admin/forgot-password" className="text-violet-400 hover:underline">Request new link</Link>
        </p>
      </motion.div>
    </div>
  );
}
