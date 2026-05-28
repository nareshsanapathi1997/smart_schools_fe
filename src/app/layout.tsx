import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementTicker } from "@/components/layout/AnnouncementTicker";
import { PublicShell, ScrollToTop } from "@/components/layout/PublicShell";
import { SCHOOL } from "@/lib/constants";

const ChatWidget = dynamic(
  () => import("@/components/chat/ChatWidget").then((m) => ({ default: m.ChatWidget })),
  { ssr: false }
);

const WhatsAppFloat = dynamic(
  () => import("@/components/shared/WhatsAppFloat").then((m) => ({ default: m.WhatsAppFloat })),
  { ssr: false }
);

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SCHOOL.name} | Premium Education`,
    template: `%s | ${SCHOOL.name}`,
  },
  description:
    "Leading smart school with AI-powered support, modern infrastructure, and academic excellence. Admissions open.",
  keywords: ["school", "education", "admissions", "hyderabad", "smart school", "AI chatbot"],
  openGraph: {
    title: SCHOOL.name,
    description: SCHOOL.tagline,
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jakarta.variable} font-sans antialiased`}>
        <Providers>
          <AnnouncementTicker />
          <Header />
          <main>
            <PublicShell>{children}</PublicShell>
          </main>
          <Footer />
          <ChatWidget />
          <WhatsAppFloat />
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  );
}
