import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Zelf gehost (geen verzoek naar Google): sneller, en geen gegevens naar derden.
const sans = localFont({
  src: [
    { path: "../../node_modules/@fontsource-variable/jost/files/jost-latin-wght-normal.woff2", style: "normal" },
    { path: "../../node_modules/@fontsource-variable/jost/files/jost-latin-wght-italic.woff2", style: "italic" },
  ],
  weight: "100 900",
  variable: "--font-sans-body",
  display: "swap",
});


export const metadata: Metadata = {
  title: "Huiskamer",
  description: "Een rustige plek voor jou en je psycholoog.",
  appleWebApp: { capable: true, title: "Huiskamer", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#EFE7DB",
  colorScheme: "light",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl-BE" className={sans.variable}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
