import type { MetadataRoute } from "next";

const SITE_URL = "https://kingwarriors.community";

const ROUTES = [
  "",
  "/daily-updates",
  "/winners",
  "/events",
  "/meetings",
  "/gallery",
  "/team",
  "/rules",
  "/contact",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
