import type { Metadata } from "next";
import PrivacyPolicyView from "@/src/component/privacy-policy/privacy-policy-view";

export const metadata: Metadata = {
  title: "Privacy Policy & WhatsApp Data Governance",
  description:
    "Official VexChat Privacy Policy detailing how WhatsApp Business Cloud API messages, contacts, analytics, and business customer data are protected and processed in compliance with GDPR, CCPA, and Meta developer terms.",
  keywords: [
    "VexChat",
    "Privacy Policy",
    "WhatsApp Business Cloud API",
    "GDPR",
    "Data Protection",
    "Meta Developer Review",
    "Customer Data",
  ],
  openGraph: {
    title: "Privacy Policy | VexChat WhatsApp Business Platform",
    description:
      "Enterprise data protection standards, Meta WhatsApp Cloud API compliance, and customer privacy rights at VexChat.",
    type: "website",
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyView />;
}
