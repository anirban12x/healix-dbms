import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Healix - Online Pharmacy",
  description: "Your trusted online pharmacy for medicines, prescriptions, and healthcare products",
  icons: {
    icon: "/images/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-inter antialiased">{children}</body>
    </html>
  );
}
