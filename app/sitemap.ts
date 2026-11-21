import type { MetadataRoute } from "next";
import { PUBLIC_PATHS, SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PUBLIC_PATHS.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE.origin}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
