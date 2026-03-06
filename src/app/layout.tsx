import type { Metadata, Viewport } from "next";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import FABWrapper from "@/components/FABWrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "Weedoloveweed",
  description: "Cannabis diary for the crew",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#16a34a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>
          <ServiceWorkerRegistrar />
          <main className="mx-auto max-w-md px-4 pb-20 pt-6">{children}</main>
          <Navbar />
          <FABWrapper />
        </Providers>
      </body>
    </html>
  );
}
