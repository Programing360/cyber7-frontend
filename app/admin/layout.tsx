import type { Metadata } from "next";
import PlatformAdminLayout from "@/src/component/admin/platform-admin-layout";


export const metadata: Metadata = {
  title: "Platform Administration | VexChat",
  description:
    "VexChat Multi-Tenant Platform Administration Dashboard and System Controls",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PlatformAdminLayout>{children}</PlatformAdminLayout>;
}
