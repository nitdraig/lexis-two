import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://lexis-two.excelso.xyz",
  output: "static",
  i18n: {
    defaultLocale: "en",
    locales: ["en", "es"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  build: {
    format: "directory",
  },
  integrations: [sitemap()],
});
