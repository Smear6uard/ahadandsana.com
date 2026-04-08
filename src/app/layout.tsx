import type { Metadata } from "next";
import { Alex_Brush, Amiri, Cormorant_Garamond, Outfit } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
  preload: true,
});

const alexBrush = Alex_Brush({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
  display: "swap",
  preload: true,
});

const amiri = Amiri({
  subsets: ["latin", "arabic"],
  weight: "400",
  variable: "--font-arabic",
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
  title: "Ahad & Sana",
  description: "Join us in celebrating the wedding of Ahad & Sana",
  icons: {
    icon: "/Elegant%20name%20design%20with%20gold%20ampersand.png",
  },
  openGraph: {
    title: "Ahad & Sana",
    description: "Join us in celebrating the wedding of Ahad & Sana",
    images: ["/Elegant%20name%20design%20with%20gold%20ampersand.png"],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${alexBrush.variable} ${amiri.variable} ${outfit.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
