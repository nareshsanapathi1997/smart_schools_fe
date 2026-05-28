"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  GraduationCap,
  Users,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Home,
  Shield,
  ClipboardList,
  BookOpen,
  CreditCard,
  Sparkles,
  HelpCircle,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SCHOOL } from "@/lib/constants";
import { useSettings } from "@/hooks/useSettings";
import { portalApi } from "@/lib/portal-api";
import { usePortalStore } from "@/store/usePortalStore";
import { getApiErrorMessage } from "@/lib/api-error";

type AccountType = "parent" | "student";

interface LoginForm {
  username: string;
  password: string;
}

const features = [
  { icon: ClipboardList, label: "Attendance", desc: "Daily records & alerts" },
  { icon: BookOpen, label: "Homework", desc: "Assignments & due dates" },
  { icon: CreditCard, label: "Fees", desc: "Invoices & payments" },
  { icon: Sparkles, label: "Results", desc: "Marks & report cards" },
];

export default function PortalLoginPage() {
  const router = useRouter();
  const setPortalAuth = usePortalStore((s) => s.setPortalAuth);
  const { settings } = useSettings();
  const school = settings.school_info || SCHOOL;

  const [accountType, setAccountType] = useState<AccountType>("student");
  const [showPassword, setShowPassword] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [error, setError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<LoginForm>();

  useEffect(() => {
    const as = new URLSearchParams(window.location.search).get("as");
    if (as === "student" || as === "parent") setAccountType(as);
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("portal_token") || usePortalStore.getState().token;
    if (storedToken) {
      router.replace("/portal/dashboard");
      return;
    }
    setCheckingAuth(false);
  }, [router]);

  useEffect(() => {
    reset({ username: "", password: "" });
    setError("");
  }, [accountType, reset]);

  if (checkingAuth) return null;

  const onSubmit = async (data: LoginForm) => {
    setError("");
    try {
      const res = await portalApi.post("/erp/portal/login", {
        account_type: accountType,
        username: data.username.trim(),
        password: data.password,
      });
      setPortalAuth(res.data.data.account, res.data.data.token);
      router.push("/portal/dashboard");
    } catch (err) {
      setError(getApiErrorMessage(err, "Invalid username or password. Please try again."));
    }
  };

  return (
    <div className="relative flex min-h-screen">
      {/* Brand panel — desktop */}
      <div className="relative hidden w-[45%] overflow-hidden bg-slate-950 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(245_72%_55%/0.35),transparent_55%)]" />
        <div className="pointer-events-none absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative z-10 p-10">
          <Link href="/" className="inline-flex items-center gap-3 text-white/90 transition hover:text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-violet-600 shadow-lg shadow-primary/30">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-bold leading-tight">{school.name}</p>
              <p className="text-xs text-slate-400">{school.tagline}</p>
            </div>
          </Link>
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-center px-10 xl:px-14">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-violet-200 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" /> Parent & Student Portal
            </span>
            <h1 className="mt-6 text-3xl font-bold leading-tight text-white xl:text-4xl">
              Stay connected with your child&apos;s education
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
              View attendance, homework, fee dues, exam results, and transport details — all in one secure portal.
            </p>
          </motion.div>

          <div className="mt-10 grid grid-cols-2 gap-4">
            {features.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
              >
                <item.icon className="mb-2 h-5 w-5 text-violet-400" />
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10 border-t border-white/5 p-10 text-xs text-slate-500">
          Need help? Call {school.phone || SCHOOL.phone}
        </div>
      </div>

      {/* Login panel */}
      <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-violet-50/40 to-slate-100 p-4 dark:from-slate-950 dark:via-violet-950/20 dark:to-slate-950 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-violet-600 text-white shadow-lg">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold">{school.name}</p>
              <p className="text-xs text-muted-foreground">Parent & Student Portal</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-border/50 bg-card/80 p-8 shadow-xl shadow-primary/5 backdrop-blur-xl dark:bg-card/60">
            <div className="mb-6 text-center lg:text-left">
              <h2 className="text-2xl font-bold">Welcome back</h2>
              <p className="mt-1 text-sm text-muted-foreground">Sign in to access your portal dashboard</p>
            </div>

            {/* Account type toggle */}
            <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-muted/60 p-1">
              {([
                { type: "parent" as const, icon: Users, label: "Parent" },
                { type: "student" as const, icon: User, label: "Student" },
              ]).map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setAccountType(type)}
                  className={cn(
                    "relative flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all",
                    accountType === type ? "text-white" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {accountType === type && (
                    <motion.span
                      layoutId="portal-login-tab"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-violet-600 shadow-md shadow-primary/25"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className="relative z-10 h-4 w-4" />
                  <span className="relative z-10">{label}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  {accountType === "parent" ? "Parent Username" : "Admission Number"}
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    {...register("username", { required: true })}
                    autoComplete="username"
                    placeholder={accountType === "parent" ? "e.g. STS-2026-0001_parent" : "e.g. STS-2026-0001"}
                    className="h-12 rounded-xl border-border/80 bg-background/80 pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    {...register("password", { required: true })}
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="h-12 rounded-xl border-border/80 bg-background/80 pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <Button type="submit" disabled={isSubmitting} className="h-12 w-full gap-2 rounded-xl text-base shadow-lg shadow-primary/20">
                {isSubmitting ? "Signing in..." : (
                  <>Sign In <ArrowRight className="h-4 w-4" /></>
                )}
              </Button>
            </form>

            {/* Help section */}
            <div className="mt-6 border-t border-border/50 pt-5">
              <button
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                className="flex w-full items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <span className="flex items-center gap-2"><HelpCircle className="h-4 w-4 text-primary" /> How do I login?</span>
                <span className="text-xs">{showHelp ? "Hide" : "Show"}</span>
              </button>
              <AnimatePresence>
                {showHelp && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 space-y-2 rounded-xl bg-muted/50 p-4 text-xs leading-relaxed text-muted-foreground">
                      <p><strong className="text-foreground">First time?</strong> Ask admin to run <em>Provision Portal Accounts</em> in Admin → Portals.</p>
                      <p><strong className="text-foreground">Parent username:</strong> your child&apos;s admission number + <code className="rounded bg-muted px-1">_parent</code></p>
                      <p><strong className="text-foreground">Student username:</strong> admission number only</p>
                      <p><strong className="text-foreground">Default password:</strong> last 4 digits of the admission number</p>
                      <p className="flex items-center gap-1.5 pt-1"><Phone className="h-3.5 w-3.5" /> Contact school office to reset password</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <Link href="/" className="inline-flex items-center gap-1.5 transition hover:text-primary">
              <Home className="h-4 w-4" /> Back to Website
            </Link>
            <span className="hidden sm:inline text-border">|</span>
            <Link href="/admin/login" className="inline-flex items-center gap-1.5 transition hover:text-primary">
              <Shield className="h-4 w-4" /> Staff Admin Login
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
