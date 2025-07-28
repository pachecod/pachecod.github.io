import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: [
      '@codemirror/lang-html',
      '@codemirror/lang-css',
      '@codemirror/lang-javascript'
    ]
  },
});