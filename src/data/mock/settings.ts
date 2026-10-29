export interface BusinessProfile {
businessName: string;
businessEmail: string;
phoneNumber: string;
website: string;
industry: string;
timezone: string;
country: string;
description: string;
}

export interface WhatsAppConfiguration {
phoneNumberId: string;
businessAccountId: string;
displayPhoneNumber: string;
connectionStatus: "CONNECTED" | "DISCONNECTED";
}

export interface NotificationPreferences {
emailNotifications: boolean;
campaignUpdates: boolean;
messageFailureAlerts: boolean;
teamActivityAlerts: boolean;
weeklyReports: boolean;
productUpdates: boolean;
}

export interface SecurityPreferences {
twoFactorEnabled: boolean;
loginAlerts: boolean;
sessionTimeout: string;
}

export interface ApiPreferences {
webhookUrl: string;
webhookEvents: string[];
}

export const initialBusinessProfile: BusinessProfile = {
businessName: "Cyber7 Demo Business",
businessEmail: "[hello@cyber7.demo](mailto:hello@cyber7.demo)",
phoneNumber: "+880 1700-000000",
website: "https://example.com",
industry: "Technology",
timezone: "Asia/Dhaka",
country: "Bangladesh",
description: "A demo business workspace for Cyber7.",
};

export const initialWhatsAppConfiguration: WhatsAppConfiguration = {
phoneNumberId: "",
businessAccountId: "",
displayPhoneNumber: "",
connectionStatus: "DISCONNECTED",
};

export const initialNotificationPreferences: NotificationPreferences = {
emailNotifications: true,
campaignUpdates: true,
messageFailureAlerts: true,
teamActivityAlerts: false,
weeklyReports: true,
productUpdates: false,
};

export const initialSecurityPreferences: SecurityPreferences = {
twoFactorEnabled: false,
loginAlerts: true,
sessionTimeout: "30",
};

export const initialApiPreferences: ApiPreferences = {
webhookUrl: "",
webhookEvents: [
"message.delivered",
"message.failed",
"message.read",
],
};

export const industryOptions = [
"Technology",
"E-commerce",
"Education",
"Healthcare",
"Finance",
"Retail",
"Other",
];

export const timezoneOptions = [
"Asia/Dhaka",
"Asia/Kolkata",
"Asia/Dubai",
"Europe/London",
"America/New_York",
"UTC",
];

export const sessionTimeoutOptions = [
{ label: "15 minutes", value: "15" },
{ label: "30 minutes", value: "30" },
{ label: "1 hour", value: "60" },
{ label: "4 hours", value: "240" },
];
