import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import type { UserConfigExport } from 'vite';

const config: UserConfigExport = async () => ({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true
  },
  envPrefix: ['VITE_', 'TAURI_'],
});

export default defineConfig(config);