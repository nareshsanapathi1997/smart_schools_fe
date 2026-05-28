"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Settings, Save, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GlowCard } from "@/components/motion/AnimatedSection";
import { PLACEHOLDER } from "@/lib/images";
import api from "@/lib/api";
import { clearSettingsCache } from "@/hooks/useSettings";

type InfraItem = { title: string; desc: string; image?: string };

function parseInfra(text: string): InfraItem[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title = "", desc = "", image = ""] = line.split("|").map((p) => p.trim());
      return { title, desc, image: image || undefined };
    });
}

function formatInfra(items: InfraItem[] = []) {
  return items.map((i) => [i.title, i.desc, i.image || ""].join(" | ")).join("\n");
}

export default function AdminSettingsPage() {
  const [school, setSchool] = useState({ name: "", tagline: "", phone: "", email: "", address: "", whatsapp: "", brochure_url: "" });
  const [stats, setStats] = useState<Record<string, string>>({});
  const [social, setSocial] = useState<Record<string, string>>({});
  const [seo, setSeo] = useState({ title: "", description: "", keywords: "" });
  const [home, setHome] = useState({ hero_title: "", hero_subtitle: "", hero_image: "", video_url: "", video_thumbnail: "" });
  const [about, setAbout] = useState<{ history?: string; vision?: string; mission?: string; principal_name?: string; principal_message?: string; infrastructure?: InfraItem[] }>({});
  const [infraText, setInfraText] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [integrations, setIntegrations] = useState<{ whatsapp?: boolean; sms?: boolean; razorpay?: boolean; email?: boolean } | null>(null);

  useEffect(() => {
    api.get("/cms/settings").then((r) => {
      const d = r.data.data || {};
      setSchool(d.school_info || {});
      setStats(d.stats || {});
      setSocial(d.social || {});
      setSeo(d.seo || {});
      setHome(d.home_page || {});
      const aboutPage = d.about_page || {};
      setAbout(aboutPage);
      setInfraText(formatInfra(aboutPage.infrastructure || []));
    }).catch(() => {});
    api.get("/cms/settings/integrations").then((r) => setIntegrations(r.data.data || null)).catch(() => {});
  }, []);

  const save = async (key: string, value: unknown) => {
    setSaving(true);
    setMsg("");
    try {
      await api.put(`/cms/settings/${key}`, { value });
      clearSettingsCache();
      setMsg("Settings saved! Refresh the website to see changes.");
    } catch {
      setMsg("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const cards = [
    {
      title: "School Information",
      content: (
        <>
          {(["name", "tagline", "phone", "email", "address", "whatsapp"] as const).map((k) => (
            <Input key={k} className="rounded-xl" placeholder={k} value={school[k] || ""} onChange={(e) => setSchool({ ...school, [k]: e.target.value })} />
          ))}
          <Input
            className="rounded-xl"
            placeholder="Admission Brochure URL (e.g. /downloads/admission-brochure.pdf)"
            value={school.brochure_url || ""}
            onChange={(e) => setSchool({ ...school, brochure_url: e.target.value })}
          />
          <Button disabled={saving} className="rounded-xl" onClick={() => save("school_info", school)}>
            <Save className="h-4 w-4" /> Save School Info
          </Button>
        </>
      ),
    },
    {
      title: "Home Page",
      content: (
        <>
          <Input className="rounded-xl" placeholder="Hero Title" value={home.hero_title || ""} onChange={(e) => setHome({ ...home, hero_title: e.target.value })} />
          <Textarea className="rounded-xl" placeholder="Hero Subtitle" value={home.hero_subtitle || ""} onChange={(e) => setHome({ ...home, hero_subtitle: e.target.value })} />
          <Input className="rounded-xl" placeholder="Hero Background Image URL" value={home.hero_image || ""} onChange={(e) => setHome({ ...home, hero_image: e.target.value })} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={home.hero_image || PLACEHOLDER.hero} alt="Hero preview" className="h-32 w-full rounded-xl object-cover ring-2 ring-primary/10" />
          <Input className="rounded-xl" placeholder="Video URL (YouTube embed)" value={home.video_url || ""} onChange={(e) => setHome({ ...home, video_url: e.target.value })} />
          <Input className="rounded-xl" placeholder="Video Thumbnail URL" value={home.video_thumbnail || ""} onChange={(e) => setHome({ ...home, video_thumbnail: e.target.value })} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={home.video_thumbnail || PLACEHOLDER.videoThumb} alt="Video preview" className="h-32 w-full rounded-xl object-cover ring-2 ring-primary/10" />
          <Button disabled={saving} className="rounded-xl" onClick={() => save("home_page", home)}>
            <Save className="h-4 w-4" /> Save Home Page
          </Button>
        </>
      ),
    },
    {
      title: "About Page",
      content: (
        <>
          <Textarea className="rounded-xl" placeholder="History" value={about.history || ""} onChange={(e) => setAbout({ ...about, history: e.target.value })} />
          <Input className="rounded-xl" placeholder="Vision" value={about.vision || ""} onChange={(e) => setAbout({ ...about, vision: e.target.value })} />
          <Input className="rounded-xl" placeholder="Mission" value={about.mission || ""} onChange={(e) => setAbout({ ...about, mission: e.target.value })} />
          <Input className="rounded-xl" placeholder="Principal Name" value={about.principal_name || ""} onChange={(e) => setAbout({ ...about, principal_name: e.target.value })} />
          <Textarea className="rounded-xl" placeholder="Principal Message" value={about.principal_message || ""} onChange={(e) => setAbout({ ...about, principal_message: e.target.value })} />
          <Textarea
            className="rounded-xl font-mono text-xs"
            rows={6}
            placeholder="Infrastructure (one per line): Title | Description | Image URL"
            value={infraText}
            onChange={(e) => setInfraText(e.target.value)}
          />
          <Button disabled={saving} className="rounded-xl" onClick={() => save("about_page", { ...about, infrastructure: parseInfra(infraText) })}>
            <Save className="h-4 w-4" /> Save About Page
          </Button>
        </>
      ),
    },
    {
      title: "Statistics, Social & SEO",
      content: (
        <>
          {Object.keys({ ...stats, students: "", teachers: "", years: "", awards: "" }).slice(0, 4).map((k) => (
            <Input key={k} className="rounded-xl" placeholder={`Stat: ${k}`} value={stats[k] || ""} onChange={(e) => setStats({ ...stats, [k]: e.target.value })} />
          ))}
          <Button disabled={saving} className="rounded-xl" onClick={() => save("stats", stats)}>
            <Save className="h-4 w-4" /> Save Stats
          </Button>
          <hr className="my-2 border-border/50" />
          {["facebook", "instagram", "twitter", "youtube", "linkedin"].map((k) => (
            <Input key={k} className="rounded-xl" placeholder={k} value={social[k] || ""} onChange={(e) => setSocial({ ...social, [k]: e.target.value })} />
          ))}
          <Button disabled={saving} className="rounded-xl" onClick={() => save("social", social)}>
            <Save className="h-4 w-4" /> Save Social Links
          </Button>
          <hr className="my-2 border-border/50" />
          <Input className="rounded-xl" placeholder="SEO Title" value={seo.title || ""} onChange={(e) => setSeo({ ...seo, title: e.target.value })} />
          <Textarea className="rounded-xl" placeholder="SEO Description" value={seo.description || ""} onChange={(e) => setSeo({ ...seo, description: e.target.value })} />
          <Input className="rounded-xl" placeholder="SEO Keywords (comma separated)" value={seo.keywords || ""} onChange={(e) => setSeo({ ...seo, keywords: e.target.value })} />
          <Button disabled={saving} className="rounded-xl" onClick={() => save("seo", seo)}>
            <Save className="h-4 w-4" /> Save SEO
          </Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
          <Settings className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Website Settings</h1>
          <p className="text-muted-foreground">All changes here update the public website</p>
        </div>
      </div>

      {msg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700"
        >
          <CheckCircle2 className="h-4 w-4" /> {msg}
        </motion.div>
      )}

      {integrations && (
        <GlowCard className="mt-8 p-6">
          <h2 className="mb-4 font-bold">Integrations Status</h2>
          <p className="mb-4 text-sm text-muted-foreground">Configured via backend environment variables (.env). Manage alert templates under Admin → Alerts.</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {([
              ["WhatsApp", integrations.whatsapp],
              ["SMS", integrations.sms],
              ["Razorpay", integrations.razorpay],
              ["Email", integrations.email],
            ] as const).map(([label, ok]) => (
              <div key={label} className={`rounded-xl border px-4 py-3 text-sm ${ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-border bg-muted/40 text-muted-foreground"}`}>
                <p className="font-semibold">{label}</p>
                <p>{ok ? "Configured" : "Not configured (mock/dev mode)"}</p>
              </div>
            ))}
          </div>
        </GlowCard>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {cards.map((card, i) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <GlowCard>
              <div className="border-b border-border/50 px-6 py-4">
                <h2 className="font-bold">{card.title}</h2>
              </div>
              <div className="space-y-3 p-6">{card.content}</div>
            </GlowCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
