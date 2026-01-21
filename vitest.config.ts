import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: [tsconfigPaths() as any],
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    testTimeout: 20000,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["api/**/*.ts"],
      exclude: [
        "api/db/**",
        "api/index.ts",
        "api/server.ts",
        "api/app.ts",
        "**/*.d.ts",
        "api/types/**",
        "scripts/**",
      ],
    },
  },
});
