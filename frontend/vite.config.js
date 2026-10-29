// Vite config: enables React fast-refresh, sets the dev server port and forwards /api to the backend.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 3000, proxy: { '/api': 'http://localhost:5000' } },
});
