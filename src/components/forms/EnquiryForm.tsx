"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  User,
  Users,
  Phone,
  Mail,
  GraduationCap,
  MapPin,
  MessageSquare,
  Send,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { useLookups } from "@/hooks/useLookups";

const FALLBACK_CLASSES = [
  "Nursery", "LKG", "UKG", "Class I", "Class II", "Class III", "Class IV", "Class V",
  "Class VI", "Class VII", "Class VIII", "Class IX", "Class X", "Class XI", "Class XII",
];

interface EnquiryFormData {
  student_name: string;
  parent_name: string;
  mobile: string;
  email: string;
  class_interested: string;
  address?: string;
  message?: string;
  website?: string;
}

interface EnquiryFormProps {
  variant?: "default" | "compact";
  className?: string;
}

function FieldLabel({ icon: Icon, label, required }: { icon: React.ElementType; label: string; required?: boolean }) {
  return (
    <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground/90">
      <Icon className="h-3.5 w-3.5 text-primary" />
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
  );
}

export function EnquiryForm({ variant = "default", className }: EnquiryFormProps) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<EnquiryFormData>();
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const { options: classOptions } = useLookups("admission_class");
  const classList = classOptions.length ? classOptions.map((o) => o.value) : FALLBACK_CLASSES;
  const compact = variant === "compact";

  const onSubmit = async (data: EnquiryFormData) => {
    setStatus(null);
    try {
      await api.post("/enquiries", data);
      setStatus({ type: "success", msg: "Enquiry submitted successfully! Our admission team will contact you within 24 hours." });
      reset();
    } catch (err) {
      setStatus({ type: "error", msg: getApiErrorMessage(err, "Submission failed. Please try again.") });
    }
  };

  const inputClass = "h-11 rounded-xl border-border/80 bg-background/80 transition focus-visible:ring-primary/30";

  if (status?.type === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn("flex flex-col items-center justify-center py-10 text-center", className)}
      >
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
        </div>
        <h3 className="text-xl font-bold">Thank You!</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{status.msg}</p>
        <Button type="button" variant="outline" className="mt-6 rounded-xl" onClick={() => setStatus(null)}>
          Submit Another Enquiry
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("space-y-5", className)}>
      <input type="text" {...register("website")} className="hidden" tabIndex={-1} autoComplete="off" />

      <div className={cn("grid gap-4", compact ? "sm:grid-cols-2" : "sm:grid-cols-2")}>
        <div>
          <FieldLabel icon={User} label="Student Name" required />
          <Input placeholder="Full name of student" className={inputClass} {...register("student_name", { required: "Student name is required" })} />
          {errors.student_name && <p className="mt-1 text-xs text-red-500">{errors.student_name.message}</p>}
        </div>
        <div>
          <FieldLabel icon={Users} label="Parent / Guardian Name" required />
          <Input placeholder="Parent or guardian name" className={inputClass} {...register("parent_name", { required: "Parent name is required" })} />
          {errors.parent_name && <p className="mt-1 text-xs text-red-500">{errors.parent_name.message}</p>}
        </div>
        <div>
          <FieldLabel icon={Phone} label="Mobile Number" required />
          <Input placeholder="+91 98765 43210" className={inputClass} {...register("mobile", { required: "Mobile number is required" })} />
          {errors.mobile && <p className="mt-1 text-xs text-red-500">{errors.mobile.message}</p>}
        </div>
        <div>
          <FieldLabel icon={Mail} label="Email Address" required />
          <Input type="email" placeholder="you@email.com" className={inputClass} {...register("email", { required: "Email is required" })} />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>
        <div className="sm:col-span-2">
          <FieldLabel icon={GraduationCap} label="Class Interested In" required />
          <select
            className={cn(inputClass, "w-full px-4 text-sm text-foreground")}
            {...register("class_interested", { required: "Please select a class" })}
            defaultValue=""
          >
            <option value="" disabled>Select class / grade</option>
            {classList.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.class_interested && <p className="mt-1 text-xs text-red-500">{errors.class_interested.message}</p>}
        </div>
        {!compact && (
          <>
            <div className="sm:col-span-2">
              <FieldLabel icon={MapPin} label="Address" />
              <Input placeholder="City, area or full address (optional)" className={inputClass} {...register("address")} />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel icon={MessageSquare} label="Additional Message" />
              <Textarea
                placeholder="Any questions about fees, transport, or admission dates..."
                className="min-h-[100px] rounded-xl border-border/80 bg-background/80"
                {...register("message")}
              />
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {status?.type === "error" && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-600"
          >
            {status.msg}
          </motion.p>
        )}
      </AnimatePresence>

      <Button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "gap-2 rounded-xl shadow-lg shadow-primary/20 transition hover:shadow-primary/30",
          compact ? "w-full" : "h-12 w-full sm:w-auto sm:min-w-[220px]"
        )}
      >
        {isSubmitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
        ) : (
          <><Send className="h-4 w-4" /> Submit Enquiry</>
        )}
      </Button>
    </form>
  );
}
