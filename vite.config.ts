import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
        type: "module",
        navigateFallback: "index.html",
      },
      includeAssets: ["favicon.ico", "sounds/*.mp3", "*.jpg", "*.png"],
      manifest: {
        name: "Halo: GO",
        short_name: "Halo: GO",
        description: "Halo: GO",
        theme_color: "#ffffff",
        icons: [
          {
            src: "halo_go_192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "halo_go_512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
