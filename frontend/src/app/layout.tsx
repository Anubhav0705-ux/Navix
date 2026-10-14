import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces, Playfair_Display } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "NAVIX — India's Premier Multi-Modal Travel Platform",
  description: "Discover destinations across India, compare trains, buses, and flights, and generate complete itineraries bounded by your total budget.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#FFF9F2] text-[#193451] selection:bg-[#246BCE]/15 selection:text-[#193451]">
        {children}
      </body>
    </html>
  );
}
