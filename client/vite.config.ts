import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  const serverPort = Number(process.env.RIN_SERVER_PORT || "11499");
  const serverTarget = `http://127.0.0.1:${serverPort}`;
  const cacheDir = process.env.RIN_VITE_CACHE_DIR || "../.vite/client";
  
  return {
    cacheDir,
    // Note: Client configuration is fetched from server at runtime
    // No environment variables are injected at build time
    build: {
      outDir: '../dist/client',
      emptyOutDir: true,
      // gzip-size reporting spawns worker threads that silently die in restricted build sandboxes (e.g. Cloudflare Workers Builds)
      reportCompressedSize: false,
      // esbuild's minifier spawns a native subprocess, which silently dies in Cloudflare's gVisor-sandboxed build container;
      // terser runs in-process and avoids that failure mode
      minify: 'terser',
      rollupOptions: {
        // throttles concurrent chunk file reads/writes during bundle generation; unbounded parallelism
        // hangs/dies silently in Cloudflare's build sandbox, matching where these builds have died
        maxParallelFileOps: 2,
      },
    },
    plugins: [
      react(),
      // Only open visualizer in a local, interactive build; opening a browser crashes headless CI builds (e.g. Cloudflare Workers Builds)
      visualizer({ open: !isDev && Boolean(process.stdout.isTTY) })
    ],
    server: {
      proxy: {
        "/api": {
          target: serverTarget,
          changeOrigin: false,
        },
        "/rss.xml": {
          target: serverTarget,
          changeOrigin: false,
        },
        "/atom.xml": {
          target: serverTarget,
          changeOrigin: false,
        },
        "/rss.json": {
          target: serverTarget,
          changeOrigin: false,
        },
        "/feed.json": {
          target: serverTarget,
          changeOrigin: false,
        },
        "/feed.xml": {
          target: serverTarget,
          changeOrigin: false,
        },
      },
    },
    // Vitest configuration
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      css: true,
    },
  }
})
