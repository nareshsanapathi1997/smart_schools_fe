"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { PageHero } from "@/components/shared/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone, Clock, Send, CheckCircle2 } from "lucide-react";
import { AnimatedSection, GlowCard } from "@/components/motion/AnimatedSection";
import { SCHOOL } from "@/lib/constants";
import { PLACEHOLDER } from "@/lib/images";
import { getApiErrorMessage } from "@/lib/api-error";
import api from "@/lib/api";

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export default function ContactPage() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactFormData>();
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const onSubmit = async (data: ContactFormData) => {
    setMsg(null);
    try {
      await api.post("/cms/contact", data);
      setMsg({ type: "success", text: "Message sent successfully! We will reply soon." });
      reset();
    } catch (err) {
      setMsg({ type: "error", text: getApiErrorMessage(err, "Failed to send. Please try again.") });
    }
  };

  const contactItems = [
    { icon: MapPin, label: "Address", value: SCHOOL.address },
    { icon: Phone, label: "Phone", value: SCHOOL.phone },
    { icon: Mail, label: "Email", value: SCHOOL.email },
    { icon: Clock, label: "Office Hours", value: "Mon-Fri: 8:30 AM - 4:00 PM" },
  ];

  return (
    <>
      <PageHero title="Contact Us" subtitle="We'd love to hear from you" backgroundImage={PLACEHOLDER.contact} breadcrumbs={[{ label: "Contact" }]} />
      <section className="container mx-auto px-4 py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <AnimatedSection>
            <div className="space-y-6">
              {contactItems.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex gap-4"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-violet-500/10 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.value}</p>
                  </div>
                </motion.div>
              ))}
              <div className="overflow-hidden rounded-2xl shadow-soft">
                <iframe title="Map" src="https://maps.google.com/maps?q=Hyderabad&t=&z=13&ie=UTF8&iwloc=&output=embed" className="h-64 w-full border-0 grayscale-[20%] transition-all hover:grayscale-0" loading="lazy" />
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.15} once={false}>
            <GlowCard className="p-8">
              <h2 className="mb-6 text-xl font-bold">Send a Message</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Input placeholder="Your Name *" className="rounded-xl" {...register("name", { required: "Name is required" })} />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                </div>
                <div>
                  <Input type="email" placeholder="Email *" className="rounded-xl" {...register("email", { required: "Email is required" })} />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                </div>
                <Input placeholder="Phone" className="rounded-xl" {...register("phone")} />
                <Input placeholder="Subject" className="rounded-xl" {...register("subject")} />
                <div>
                  <Textarea placeholder="Message *" className="rounded-xl" {...register("message", { required: "Message is required" })} />
                  {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
                </div>
                {msg && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`flex items-center gap-2 text-sm ${msg.type === "success" ? "text-emerald-600" : "text-red-500"}`}
                  >
                    {msg.type === "success" && <CheckCircle2 className="h-4 w-4" />}
                    {msg.text}
                  </motion.p>
                )}
                <Button type="submit" disabled={isSubmitting} className="w-full rounded-xl">
                  {isSubmitting ? "Sending..." : <>Send Message <Send className="h-4 w-4" /></>}
                </Button>
              </form>
            </GlowCard>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
