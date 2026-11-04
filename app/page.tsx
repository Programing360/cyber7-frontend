"use client";

import AiAssistantDemo from "@/src/component/main/AiAssistantDemo";
import ApiDocumentation from "@/src/component/main/ApiDocumentation";
import AutomationVisualizer from "@/src/component/main/AutomationVisualizer";
import BentoFeatures from "@/src/component/main/BentoFeatures";
import CallingFeature from "@/src/component/main/CallingFeature";
import ComplianceSection from "@/src/component/main/ComplianceSection";
import CtaBanner from "@/src/component/main/CtaBanner";
import FaqSection from "@/src/component/main/FaqSection";
import Footer from "@/src/component/main/footer";
import HeroSection from "@/src/component/main/HeroSection";
import InboxSimulator from "@/src/component/main/InboxSimulator";
import Modals from "@/src/component/main/Modals";
import Navbar from "@/src/component/main/navbar";
import PaymentMethods from "@/src/component/main/PaymentMethods";
import PricingCalculator from "@/src/component/main/PricingCalculator";
import React, { useState } from "react";


export default function Home() {
  const [demoOpen, setDemoOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [selectedPlanInfo, setSelectedPlanInfo] = useState<{ name: string; price: string } | undefined>(
    undefined
  );

  const handleOpenDemo = (planName?: string, price?: string) => {
    if (planName && price) {
      setSelectedPlanInfo({ name: planName, price });
    } else {
      setSelectedPlanInfo(undefined);
    }
    setDemoOpen(true);
  };

  const handleCloseModals = () => {
    setDemoOpen(false);
    setContactOpen(false);
    setTermsOpen(false);
    setPrivacyOpen(false);
    setRefundOpen(false);
  };

  const scrollToInbox = () => {
    const el = document.getElementById("inbox-demo");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f9f4]">
      {/* Navigation */}
      <Navbar
        onOpenDemoModal={() => handleOpenDemo()}
        onOpenContactModal={() => setContactOpen(true)}
      />

      <main className="flex-1">
        {/* 1. Hero Section */}
        <HeroSection
          onOpenDemoModal={() => handleOpenDemo()}
          onExploreDemo={scrollToInbox}
        />

        {/* 2. Interactive WhatsApp Inbox Live Simulator (PDF Sec 1 & 6) */}
        <InboxSimulator />

        {/* 3. WhatsApp Business Calling & Call Center System (PDF Sec 35) */}
        <CallingFeature />

        {/* 4. Core SaaS Bento Features (PDF Sec 2, 3, 4, 13, 14, 27) */}
        <BentoFeatures />

        {/* 5. Workflow Automation Engine (PDF Sec 12) */}
        <AutomationVisualizer />

        {/* 6. AI Troubleshooting & Client Assistant (PDF Sec 10) */}
        <AiAssistantDemo />

        {/* 7. Meta Official Compliance & Multi-Tenant Security (PDF Sec 26, 27, 34) */}
        <ComplianceSection />

        {/* 8. Pricing & Meta Conversation Estimator (PDF Sec 8 & 24) */}
        <PricingCalculator
          onSelectPlan={(name, price) => handleOpenDemo(name, price)}
        />

        {/* 9. Payment Methods & Automated Flow (PDF Sec 7 & 9 - bKash, Nagad, Visa, Crypto) */}
        <PaymentMethods />

        {/* 10. Developer API & Idempotent Webhooks (PDF Sec 18 & 19) */}
        <ApiDocumentation />

        {/* 11. Frequently Asked Questions (PDF Sec 13) */}
        <FaqSection />

        {/* 12. Conversion CTA Banner */}
        <CtaBanner
          onOpenDemoModal={() => handleOpenDemo()}
          onOpenContactModal={() => setContactOpen(true)}
        />
      </main>

      {/* 13. Comprehensive SaaS Footer (Disclaimers, Terms, Privacy, Contacts) */}
      <Footer
        onOpenTerms={() => setTermsOpen(true)}
        onOpenPrivacy={() => setPrivacyOpen(true)}
        onOpenRefund={() => setRefundOpen(true)}
        onOpenContact={() => setContactOpen(true)}
      />

      {/* Interactive Modal Windows */}
      <Modals
        demoOpen={demoOpen}
        contactOpen={contactOpen}
        termsOpen={termsOpen}
        privacyOpen={privacyOpen}
        refundOpen={refundOpen}
        selectedPlanInfo={selectedPlanInfo}
        onClose={handleCloseModals}
      />
    </div>
  );
}
