import type { Metadata } from "next";

import "./globals.css";
import { AuthProvider } from "@/src/context/auth-context";
import { WorkspaceProvider } from "@/src/context/workspace-context";

export const metadata: Metadata = {
  title: {
    default: "VexChat | WhatsApp Business Platform",
    template: "%s | VexChat",
  },
  description:
    "Send messages, manage customers with CRM, run marketing campaigns, and use our developer API, all in one place. VexChat uses Meta's official WhatsApp Cloud API to help businesses manage WhatsApp communication.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <WorkspaceProvider>{children}</WorkspaceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
