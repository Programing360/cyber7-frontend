import type { Metadata } from "next";
import PrivacyPolicyView from "@/src/component/privacy-policy/privacy-policy-view";

export const metadata: Metadata = {
  title: "Privacy Policy & WhatsApp Data Governance",
  description:
    "Official Cyber7 Privacy Policy detailing how WhatsApp Business Cloud API messages, contacts, analytics, and business customer data are protected and processed in compliance with GDPR, CCPA, and Meta developer terms.",
  keywords: [
    "Cyber7",
    "Privacy Policy",
    "WhatsApp Business Cloud API",
    "GDPR",
    "Data Protection",
    "Meta Developer Review",
    "Customer Data",
  ],
  openGraph: {
    title: "Privacy Policy | Cyber7 WhatsApp Business Platform",
    description:
      "Enterprise data protection standards, Meta WhatsApp Cloud API compliance, and customer privacy rights at Cyber7.",
    type: "website",
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyView />;
}
