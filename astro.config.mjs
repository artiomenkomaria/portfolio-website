import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://alexmorozov.design",
  output: "static",
  integrations: [mdx(), react(), sitemap()],
  build: { inlineStylesheets: "auto" },
});
