import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";

const figtree = Figtree({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "RentRoll: never miss a rent payment",
  description: "Track rent, see who's due, record payments and get daily email reminders. Made for Indian landlords and PG owners.",
};

export const viewport: Viewport = { themeColor: "#083d36", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={figtree.variable}>
      <body>{children}</body>
    </html>
  );
}
