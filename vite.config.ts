import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import vike from 'vike/plugin';

import { type UserConfig } from 'vite';

const config: UserConfig = {
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    vue(),
    vike({
      prerender: true,
    }),
  ],
};

export default config;
