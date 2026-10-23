import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import compression from "vite-plugin-compression";

export default defineConfig(({ mode }) => {
  const analyze = mode === "analyze";
  const manualChunks = (id) => {
    if (id.includes("node_modules/react") || id.includes("node_modules/react-dom") || id.includes("node_modules/react-router-dom")) {
      return "vendor-react";
    }

    if (
      id.includes("node_modules/react-hook-form") ||
      id.includes("node_modules/@hookform/resolvers") ||
      id.includes("node_modules/zod")
    ) {
      return "vendor-form";
    }

    return undefined;
  };

  return {
    plugins: [
      react(),
      compression({
        algorithm: "brotliCompress",
        ext: ".br",
        threshold: 10240
      }),
      analyze
        ? visualizer({
            filename: "dist/stats.html",
            open: false,
            gzipSize: true,
            brotliSize: true
          })
        : null
    ].filter(Boolean),
    server: {
      port: 5173
    },
    build: {
      chunkSizeWarningLimit: 250,
      rollupOptions: {
        output: {
          manualChunks
        }
      }
    },
    test: {
      environment: "jsdom",
      setupFiles: "./src/test/setup.js",
      include: ["src/**/*.test.{js,jsx}"],
      coverage: {
        provider: "v8",
        reporter: ["text", "html"],
        include: ["src/components/**", "src/hooks/**", "src/utils/**"],
        thresholds: {
          statements: 70,
          branches: 60,
          functions: 73,
          lines: 70
        }
      }
    }
  };
});
