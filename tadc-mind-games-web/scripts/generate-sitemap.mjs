import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { relatedGames } from "../src/data/relatedGames.js";
import { sitemapRoutes } from "../src/seo/sitemapRoutes.js";
import { siteSeo } from "../src/seo/site.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = join(rootDir, "public", "sitemap.xml");

const normalizePath = (path) => {
  if (path === "/") return "/";
  return path.endsWith("/") ? path : `${path}/`;
};

const escapeXml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const toAbsoluteUrl = (path) => new URL(normalizePath(path), siteSeo.url).toString();

const staticEntries = sitemapRoutes.map((route) => ({
  loc: toAbsoluteUrl(route.path),
  lastmod: route.lastmod,
  changefreq: route.changefreq,
  priority: route.priority,
}));

const relatedGameEntries = relatedGames.map((game) => ({
  loc: toAbsoluteUrl(`/related-games/${game.addressBar}/`),
  lastmod: game.updatedDate ?? game.publishDate,
  changefreq: "monthly",
  priority: "0.6",
}));

const entries = [...staticEntries, ...relatedGameEntries].sort((a, b) =>
  a.loc.localeCompare(b.loc),
);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${escapeXml(entry.lastmod)}</lastmod>
    <changefreq>${escapeXml(entry.changefreq)}</changefreq>
    <priority>${escapeXml(entry.priority)}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, xml, "utf8");

console.log(`Generated sitemap.xml with ${entries.length} URLs.`);
