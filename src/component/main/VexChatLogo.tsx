"use client";

import React from "react";
import Image from "next/image";

interface VexChatLogoProps {
    className?: string;
    size?: "sm" | "md" | "lg";
    inverted?: boolean;
}

export default function VexChatLogo({
    className = "",
    size = "md",
    inverted = false,
}: VexChatLogoProps) {
    const iconSizes = {
        sm: "h-7 w-7",
        md: "h-9 w-9",
        lg: "h-11 w-11",
    };

    const textSizes = {
        sm: "text-base",
        md: "text-lg sm:text-xl",
        lg: "text-2xl sm:text-3xl",
    };

    return (
        <div className={`flex items-center gap-2.5 ${className}`}>
            {/* VexChat Soft Green Rounded Icon */}
            <div
                className={`${iconSizes[size]} rounded-xl bg-[#52ba69] flex items-center justify-center text-slate-950 shadow-sm shrink-0`}
            >
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-slate-900"
                >
                    {/* Two layered chat bubbles matching the uploaded picture */}
                    <path d="M14 9a2 2 0 0 1-2 2H6l-3 3V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2z" />
                    <path d="M18 9h1a2 2 0 0 1 2 2v8l-3-3h-6a2 2 0 0 1-2-2v-1" />
                </svg>
            </div>

            {/* VexChat Brand Name */}
            <div className="flex items-baseline">
                <span
                    className={`font-extrabold tracking-tight ${textSizes[size]} ${inverted ? "text-white" : "text-slate-900"
                        }`}
                >
                    Vex<span className="text-[#2e7d32]">Chat</span>
                </span>
            </div>
        </div>
    );
}
