"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { GraduationCap, Lock, Eye, EyeOff, ArrowRight, Home, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SCHOOL } from "@/lib/constants";
import { teacherApi, setTeacherToken } from "@/lib/teacher-api";
import { getApiErrorMessage } from "@/lib/api-error";

interface LoginForm {
  username: string;
  password: string;
}

export default function TeacherLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<LoginForm>();

  useEffect(() => {
    if (localStorage.getItem("teacher_token")) {
      router.replace("/teacher/dashboard");
      return;
    }
    setCheckingAuth(false);
  }, [router]);

  if (checkingAuth) return null;

  const onSubmit = async (data: LoginForm) => {
    setError("");
    try {
      const res = await teacherApi.post("/erp/teacher/login", {
        username: data.username.trim(),
        password: data.password,
      });
      setTeacherToken(res.data.data.token);
      router.push("/teacher/dashboard");
    } catch (err) {
      setError(getApiErrorMessage(err, "Invalid username or password."));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-violet-50/40 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-violet-600 text-white shadow-lg">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <p className="font-bold">{SCHOOL.name}</p>
            <p className="text-xs text-muted-foreground">Teacher Portal</p>
          </div>
        </div>

        <div className="rounded-3xl border border-border/50 bg-card/80 p-8 shadow-xl backdrop-blur-xl">
          <h1 className="text-2xl font-bold">Teacher Sign In</h1>
          <p className="mt-1 text-sm text-muted-foreground">View your timetable and assigned homework</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Username</label>
              <Input
                {...register("username", { required: true })}
                autoComplete="username"
                placeholder="faculty email or username"
                className="h-12 rounded-xl"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  {...register("password", { required: true })}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter password"
                  className="h-12 rounded-xl pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-600">{error}</p>}

            <Button type="submit" disabled={isSubmitting} className="h-12 w-full gap-2 rounded-xl">
              {isSubmitting ? "Signing in..." : <>Sign In <ArrowRight className="h-4 w-4" /></>}
            </Button>
          </form>

          <p className="mt-4 text-xs text-muted-foreground">
            First time? Ask admin to run <strong>Provision Teacher Accounts</strong> in Admin → Portals. Default password: <code>teacher123</code>
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          <Link href="/" className="inline-flex items-center gap-1.5 hover:text-primary"><Home className="h-4 w-4" /> Website</Link>
          <Link href="/admin/login" className="inline-flex items-center gap-1.5 hover:text-primary"><Shield className="h-4 w-4" /> Admin Login</Link>
        </div>
      </div>
    </div>
  );
}
