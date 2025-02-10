import { defineConfig, UserConfig } from 'vite';
import { resolve } from 'path';

const config: UserConfig = defineConfig({
  build: {
    target: 'node22',
    ssr: true,
    lib: {
      entry: resolve(__dirname, 'src/websocket/index.ts'),
      formats: ['es'],
      fileName: 'websocket'
    },
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      external: [
        'ws',
        'redis',
        'http',
        'https',
        /node:.*/,
      ],
      output: {
        format: 'es',
        preserveModules: true,
        preserveModulesRoot: 'src',
        paths: {
          'ws': 'ws',
          'redis': 'redis',
          'http': 'http',
          'https': 'https'
        }
      }
    }
  },
  resolve: {
    alias: {
      '$lib': resolve(__dirname, './src/lib'),
      '$types': resolve(__dirname, './src/lib/types')
    }
  },
  optimizeDeps: {
    disabled: true
  },
});

export default config;
