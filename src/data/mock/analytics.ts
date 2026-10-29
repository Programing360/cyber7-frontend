export type AnalyticsPeriod = "7d" | "30d" | "90d";

export interface MessageMetric {
  date: string;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
}

export interface CampaignMetric {
  id: string;
  name: string;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
}

export interface AnalyticsSummary {
  totalSent: number;
  delivered: number;
  read: number;
  failed: number;
  pending: number;
}

export interface MessageStatusMetric {
  name: string;
  value: number;
}

const last7Days: MessageMetric[] = [
  { date: "Oct 23", sent: 820, delivered: 780, read: 610, failed: 20 },
  { date: "Oct 24", sent: 950, delivered: 910, read: 730, failed: 18 },
  { date: "Oct 25", sent: 740, delivered: 705, read: 550, failed: 15 },
  { date: "Oct 26", sent: 1100, delivered: 1050, read: 850, failed: 25 },
  { date: "Oct 27", sent: 980, delivered: 945, read: 760, failed: 12 },
  { date: "Oct 28", sent: 1250, delivered: 1200, read: 990, failed: 22 },
  { date: "Oct 29", sent: 1380, delivered: 1320, read: 1080, failed: 28 },
];

const last30Days: MessageMetric[] = [
  { date: "Oct 01", sent: 620, delivered: 590, read: 450, failed: 18 },
  { date: "Oct 03", sent: 740, delivered: 710, read: 550, failed: 15 },
  { date: "Oct 05", sent: 680, delivered: 650, read: 510, failed: 12 },
  { date: "Oct 07", sent: 920, delivered: 880, read: 690, failed: 20 },
  { date: "Oct 09", sent: 850, delivered: 815, read: 640, failed: 16 },
  { date: "Oct 11", sent: 1050, delivered: 1010, read: 790, failed: 24 },
  { date: "Oct 13", sent: 900, delivered: 865, read: 680, failed: 17 },
  { date: "Oct 15", sent: 1180, delivered: 1130, read: 910, failed: 25 },
  { date: "Oct 17", sent: 980, delivered: 940, read: 750, failed: 19 },
  { date: "Oct 19", sent: 1250, delivered: 1200, read: 960, failed: 28 },
  { date: "Oct 21", sent: 1120, delivered: 1070, read: 850, failed: 20 },
  { date: "Oct 23", sent: 1350, delivered: 1290, read: 1040, failed: 30 },
  { date: "Oct 25", sent: 1240, delivered: 1190, read: 950, failed: 24 },
  { date: "Oct 27", sent: 1420, delivered: 1360, read: 1100, failed: 26 },
  { date: "Oct 29", sent: 1380, delivered: 1320, read: 1080, failed: 28 },
];

const last90Days: MessageMetric[] = [
  { date: "Aug 01", sent: 420, delivered: 395, read: 300, failed: 12 },
  { date: "Aug 08", sent: 550, delivered: 520, read: 410, failed: 14 },
  { date: "Aug 15", sent: 620, delivered: 590, read: 460, failed: 16 },
  { date: "Aug 22", sent: 580, delivered: 550, read: 425, failed: 15 },
  { date: "Aug 29", sent: 700, delivered: 665, read: 520, failed: 18 },
  { date: "Sep 05", sent: 760, delivered: 725, read: 570, failed: 20 },
  { date: "Sep 12", sent: 820, delivered: 785, read: 620, failed: 22 },
  { date: "Sep 19", sent: 790, delivered: 755, read: 590, failed: 19 },
  { date: "Sep 26", sent: 950, delivered: 910, read: 720, failed: 24 },
  { date: "Oct 03", sent: 880, delivered: 845, read: 660, failed: 21 },
  { date: "Oct 10", sent: 1050, delivered: 1010, read: 800, failed: 25 },
  { date: "Oct 17", sent: 1180, delivered: 1130, read: 900, failed: 28 },
  { date: "Oct 24", sent: 1320, delivered: 1260, read: 1020, failed: 30 },
  { date: "Oct 29", sent: 1380, delivered: 1320, read: 1080, failed: 28 },
];

export const analyticsData: Record<AnalyticsPeriod, MessageMetric[]> = {
  "7d": last7Days,
  "30d": last30Days,
  "90d": last90Days,
};

export const analyticsSummary: Record<AnalyticsPeriod, AnalyticsSummary> = {
  "7d": {
    totalSent: 7220,
    delivered: 6860,
    read: 5570,
    failed: 140,
    pending: 220,
  },
  "30d": {
    totalSent: 30000,
    delivered: 28800,
    read: 23000,
    failed: 600,
    pending: 600,
  },
  "90d": {
    totalSent: 52000,
    delivered: 49800,
    read: 39800,
    failed: 1000,
    pending: 1200,
  },
};

export const campaignMetrics: CampaignMetric[] = [
  {
    id: "campaign-1",
    name: "October Product Launch",
    sent: 8500,
    delivered: 8160,
    read: 6528,
    failed: 170,
  },
  {
    id: "campaign-2",
    name: "Welcome Message",
    sent: 6200,
    delivered: 6014,
    read: 5112,
    failed: 62,
  },
  {
    id: "campaign-3",
    name: "Flash Sale Announcement",
    sent: 4800,
    delivered: 4464,
    read: 3125,
    failed: 144,
  },
  {
    id: "campaign-4",
    name: "Customer Follow-up",
    sent: 3200,
    delivered: 3104,
    read: 2483,
    failed: 32,
  },
];

export function getMessageStatusMetrics(
  summary: AnalyticsSummary,
): MessageStatusMetric[] {
  return [
    { name: "Delivered", value: summary.delivered },
    { name: "Read", value: summary.read },
    { name: "Pending", value: summary.pending },
    { name: "Failed", value: summary.failed },
  ];
}
