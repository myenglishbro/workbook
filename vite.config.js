import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Using basic config; plugin not required for simple JSX, but included if available
export default defineConfig({
  plugins: [react()],
});

