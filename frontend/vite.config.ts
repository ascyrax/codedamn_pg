import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: "./src",
  publicDir:"./src/public",
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 80
  }
});
