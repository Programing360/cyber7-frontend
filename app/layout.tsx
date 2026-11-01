import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/src/context/auth-context";
import { WorkspaceProvider } from "@/src/context/workspace-context";

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
      <body>
        <AuthProvider>
          <WorkspaceProvider>{children}</WorkspaceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
