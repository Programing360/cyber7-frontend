import type { Metadata } from "next";
import TermsOfServiceView from "@/src/component/terms-of-service/terms-of-service-view";

export const metadata: Metadata = {
  title: "VexChat Terms of Service",
  description:
    "Read VexChat's Terms of Service to understand the terms and conditions governing the use of our WhatsApp Business communication platform.",
  keywords: [
    "VexChat",
    "Terms of Service",
    "Terms of Use",
    "WhatsApp Business Cloud API",
    "Meta Developer Terms",
    "Messaging Compliance",
    "SaaS Agreement",
  ],
  openGraph: {
    title: "VexChat Terms of Service | WhatsApp Business Platform",
    description:
      "Official Terms of Service for the VexChat WhatsApp Business unified communications and workspace platform.",
    type: "website",
  },
};

export default function TermsOfServicePage() {
  return <TermsOfServiceView />;
}

