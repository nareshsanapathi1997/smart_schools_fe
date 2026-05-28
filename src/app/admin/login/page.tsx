"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Lock, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<{ email: string; password: string }>();
  const [error, setError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token") || useAuthStore.getState().token;
    if (storedToken) {
      router.replace("/admin");
      return;
    }
    setCheckingAuth(false);
  }, [router]);

  if (checkingAuth) return null;

  const onSubmit = async (data: { email: string; password: string }) => {
    setError("");
    try {
      const res = await api.post("/auth/login", data);
      setAuth(res.data.data.user, res.data.data.token);
      router.push("/admin");
    } catch {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="absolute inset-0 bg-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(245_72%_55%/0.25),transparent_50%)]" />
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-96 w-96 animate-float rounded-full bg-violet-600/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-80 w-80 animate-float rounded-full bg-indigo-500/15 blur-3xl [animation-delay:2s]" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-2xl"
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-violet-500 to-accent" />
        <div className="mb-8 text-center">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 6 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/40"
          >
            <GraduationCap className="h-8 w-8" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
          <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-slate-400">
            <Sparkles className="h-3.5 w-3.5 text-violet-400" /> Smart School Dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            {...register("email", { required: true })}
            className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500"
          />
          <Input
            type="password"
            placeholder="Password"
            {...register("password", { required: true })}
            className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-slate-500"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" className="h-12 w-full rounded-xl" disabled={isSubmitting}>
            <Lock className="h-4 w-4" />
            {isSubmitting ? "Signing in..." : "Sign In Securely"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm">
          <Link href="/admin/forgot-password" className="text-violet-400 hover:underline">Forgot password?</Link>
        </p>
        <p className="mt-4 text-center text-xs text-slate-500">Default: admin@smartschool.edu / Admin@123456</p>
      </motion.div>
    </div>
  );
}
