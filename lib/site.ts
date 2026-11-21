import type { Metadata } from "next";

export const SITE = {
  origin: "https://crm.prostudio.my",
  name: "Studio Pro WhatsApp",
  legalName: "Studio Pro",
  description:
    "AI-powered WhatsApp assistant by Studio Pro. Turn WhatsApp into a sales channel with AI auto-replies, a unified inbox and one-click human handoff.",
  email: "sales@prostudio.my",
  phone: "+60138699933",
  phoneDisplay: "013-869 9933",
  locality: "Kota Kinabalu",
  region: "Sabah",
  country: "Malaysia",
  parentSite: "https://prostudio.my",
  sameAs: [
    "https://www.facebook.com/prostudio.my",
    "https://www.instagram.com/prostudio.my",
  ],
} as const;

type ChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export const PUBLIC_PATHS: Array<{
  path: string;
  priority: number;
  changeFrequency: ChangeFrequency;
}> = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.8, changeFrequency: "monthly" },
  { path: "/terms", priority: 0.4, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.4, changeFrequency: "yearly" },
  { path: "/knowledge", priority: 0.6, changeFrequency: "monthly" },
  { path: "/connect", priority: 0.6, changeFrequency: "monthly" },
  { path: "/inbox", priority: 0.3, changeFrequency: "monthly" },
  { path: "/settings", priority: 0.2, changeFrequency: "yearly" },
];

type PageMetaInput = {
  path: string;
  title: string;
  description: string;
};

export function pageMetadata({ path, title, description }: PageMetaInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE.name,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}
