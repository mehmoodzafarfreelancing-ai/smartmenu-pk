import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartMenu PK",
  description: "AI-powered digital menu from any photo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
