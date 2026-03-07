import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Change "actelis-price-tool" to match your GitHub repo name exactly.
// If deploying to a custom domain (WordPress), set base: "/"
const REPO_NAME = "actelis-price-tool";

export default defineConfig({
  plugins: [react()],
  base: `/${REPO_NAME}/`,
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
