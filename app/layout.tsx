import type { Metadata, Viewport } from "next";
import { Hind } from "next/font/google";
import "./globals.css";

const hind = Hind({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-hind" });

export const metadata: Metadata = {
  title: "RentRoll",
  description: "Know whose rent is due and record payments in a few taps.",
};

export const viewport: Viewport = { themeColor: "#123D33", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={hind.variable}>
      <body>{children}</body>
    </html>
  );
}
