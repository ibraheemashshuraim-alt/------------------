import type { Metadata } from "next";
import { Noto_Nastaliq_Urdu, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";

const notoNastaliqUrdu = Noto_Nastaliq_Urdu({
  variable: "--font-urdu",
  subsets: ["arabic"],
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "محاورات کی دنیا | Urdu Idioms Game",
  description: "An educational quiz game for learning Urdu idioms.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ur"
      dir="rtl"
      className={`${notoNastaliqUrdu.variable} ${notoSansArabic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
