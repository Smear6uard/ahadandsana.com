import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
  preload: true,
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-script",
  display: "swap",
  preload: true,
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Ahad & Sana — Summer 2026",
  description:
    "Join us in celebrating the wedding of Ahad and Sana. July 16 & 17, 2026 in Chicago.",
  openGraph: {
    title: "Ahad & Sana — Wedding Celebration",
    description:
      "Join us in celebrating the wedding of Ahad and Sana. July 16 & 17, 2026 in Chicago.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${playfair.variable} ${outfit.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
