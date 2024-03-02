import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

import vue from "@astrojs/vue";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: cloudflare({
    imageService: "cloudflare",
    runtime: {
      mode: "local",
      type: "pages",
      bindings: {
        SHORTAGE_AUTH: {
          type: "d1"
        }
      }
    }
  }),
  integrations: [vue()]
});