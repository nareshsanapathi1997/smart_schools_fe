"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, GraduationCap, Moon, Sun, Sparkles, LogIn } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { SCHOOL, NAV_LINKS } from "@/lib/constants";
import { useSettings } from "@/hooks/useSettings";
import { cn } from "@/lib/utils";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { settings } = useSettings();
  const school = settings.school_info || SCHOOL;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname.startsWith("/admin") || pathname.startsWith("/portal")) return null;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-500",
        scrolled
          ? "border-primary/10 bg-white/90 shadow-lg shadow-primary/5 backdrop-blur-2xl dark:bg-slate-950/90"
          : "border-transparent bg-white/60 backdrop-blur-xl dark:bg-slate-950/60"
      )}
    >
      <div className="container mx-auto flex h-18 items-center justify-between px-4 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.06, rotate: 3 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-violet-600 to-accent text-white shadow-lg shadow-primary/40"
          >
            <GraduationCap className="h-6 w-6" />
          </motion.div>
          <div className="hidden sm:block">
            <p className="text-lg font-bold leading-tight tracking-tight">{school.name || SCHOOL.name}</p>
            <p className="text-xs text-muted-foreground">{school.tagline || SCHOOL.tagline}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-0.5 xl:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={cn("nav-link", pathname === link.href && "active")}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className="relative rounded-xl"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          <Link href="/portal/login" className="hidden md:block">
            <Button variant="outline" size="sm" className="gap-1.5 rounded-xl">
              <LogIn className="h-3.5 w-3.5" /> Portal Login
            </Button>
          </Link>
          <Link href="/admission-enquiry" className="hidden md:block">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button size="sm" className="gap-1.5 rounded-xl">
                <Sparkles className="h-3.5 w-3.5" /> Apply Now
              </Button>
            </motion.div>
          </Link>
          <Button variant="ghost" size="icon" className="xl:hidden" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-border/40 xl:hidden"
          >
            <nav className="container mx-auto grid gap-1 px-4 py-4">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block rounded-xl px-4 py-3 text-sm font-medium hover:bg-primary/10",
                      pathname === link.href && "bg-primary/10 text-primary"
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <Link href="/portal/login" onClick={() => setOpen(false)}>
                <Button variant="outline" className="mt-2 w-full gap-2">
                  <LogIn className="h-4 w-4" /> Portal Login
                </Button>
              </Link>
              <Link href="/admission-enquiry" onClick={() => setOpen(false)}>
                <Button className="mt-2 w-full">Apply Now</Button>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
