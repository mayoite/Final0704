import type { Metadata } from "next";
import "./globals.css";
import DynamicBotWrapper from "@/components/bot/DynamicBotWrapper";
import { ciscoSans, helveticaNeue } from "@/lib/fonts";
import { SITE_URL } from "@/lib/siteUrl";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "One&Only CAD Suite",
  description: "Professional interior planning and 3D configuration tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ciscoSans.variable} ${helveticaNeue.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <DynamicBotWrapper />
      </body>
    </html>
  );
}
