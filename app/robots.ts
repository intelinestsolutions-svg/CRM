import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/settings"],
      other: {
        "Content-Signal": "search=yes, ai-train=no",
      },
    },
    sitemap: `${SITE.origin}/sitemap.xml`,
  };
}
