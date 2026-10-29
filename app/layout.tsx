import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Cyber7 | WhatsApp Business Platform",
    template: "%s | Cyber7",
  },
  description:
    "Manage WhatsApp conversations, contacts, campaigns, teams, and business analytics from one platform.",
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
