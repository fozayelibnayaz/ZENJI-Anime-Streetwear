import type { MetadataRoute } from "next";
import { products } from "@/content/products";
import { site } from "@/content/site";

export const dynamic = "force-static";

const routes = ["", "/drop", "/lookbook", "/drop-day", "/fit-lab", "/closet", "/shrine", "/studio", "/arcade", "/origin", "/support"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    ...routes.map((route) => ({
      url: `${site.url}${route}`,
      lastModified: now,
      changeFrequency: route === "" || route === "/drop" ? ("weekly" as const) : ("monthly" as const),
      priority: route === "" ? 1 : 0.7,
    })),
    ...products.map((product) => ({
      url: `${site.url}/drop/${product.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
