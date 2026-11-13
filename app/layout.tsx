import type { Metadata } from "next";

import "./globals.css";
import { AuthProvider } from "@/src/context/auth-context";
import { WorkspaceProvider } from "@/src/context/workspace-context";

import { Geist } from "next/font/google";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "VexChat | WhatsApp Business Platform",
    template: "%s | VexChat",
  },
  description:
    "Send messages, manage customers with CRM, run marketing campaigns, and use our developer API, all in one place. VexChat uses Meta's official WhatsApp Cloud API to help businesses manage WhatsApp communication.",

  // Facebook Domain Verification
  other: {
    "facebook-domain-verification": "mrk9l7tgvd7652p278jgk6xdcgnqh6",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <WorkspaceProvider>{children}</WorkspaceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
