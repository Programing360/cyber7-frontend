import type { Metadata } from "next";
import TermsOfServiceView from "@/src/component/terms-of-service/terms-of-service-view";

export const metadata: Metadata = {
  title: "Cyber7 Terms of Service",
  description:
    "Read Cyber7's Terms of Service to understand the terms and conditions governing the use of our WhatsApp Business communication platform.",
  keywords: [
    "Cyber7",
    "Terms of Service",
    "Terms of Use",
    "WhatsApp Business Cloud API",
    "Meta Developer Terms",
    "Messaging Compliance",
    "SaaS Agreement",
  ],
  openGraph: {
    title: "Cyber7 Terms of Service | WhatsApp Business Platform",
    description:
      "Official Terms of Service for the Cyber7 WhatsApp Business unified communications and workspace platform.",
    type: "website",
  },
};

export default function TermsOfServicePage() {
  return <TermsOfServiceView />;
}

