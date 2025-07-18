import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact()],
  resolve: {
    alias: {
      react: "preact/compat",
      "react-dom": "preact/compat",
    },
  },
  server: {
    proxy: {
      "/api": "http://my-esp32.local",
    },
  },
  assetsInclude: ["**/*.csv"],
  // Add specific handling for CSV files
  build: {
    rollupOptions: {
      plugins: [],
    },
  },
});
