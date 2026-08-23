import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ParticleBackground from "@/components/ParticleBackground";
import NavBar from "@/components/NavBar";
import MobileTaskbar from "@/components/MobileTaskbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://quant-a-maze.vercel.app"),
  title: {
    default: "Quant-A-Maze 3.0 | Q-Bits",
    template: "%s | Quant-A-Maze 3.0",
  },
  description:
    "Quant-A-Maze 3.0 is a 36-hour national-level hackathon by Q-Bits at NMIT Bangalore, hosted in partnership with KwantumG Research Labs.",
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "Quant-A-Maze 3.0 | Q-Bits",
    description:
      "A 36-hour national-level hackathon exploring quantum technology, AI, Web3, and post-quantum cryptography.",
    images: [{ url: "/abt_theme.jpg", width: 1200, height: 630, alt: "Quant-A-Maze 3.0" }],
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0A0A0A] text-[#F2F2F2]">
        <ParticleBackground />
        <NavBar />
        <div className="mobile-page-shell flex-1 flex flex-col sm:pb-0">
          {children}
        </div>
        <MobileTaskbar />
      </body>
    </html>
  );
}
