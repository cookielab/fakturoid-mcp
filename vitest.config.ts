import { defineConfig } from "vitest/config";

// biome-ignore lint/style/noDefaultExport: Vitest requirement
export default defineConfig({
	test: {
		watch: false,
		environment: "node",
		testTimeout: 10_000,

		coverage: {
			enabled: true,
			provider: "v8",
			reporter: ["cobertura"],
			exclude: ["node_modules/**", "test/**", "*.config.js", "dist/**"],
		},

		reporters: ["default", "junit"],

		outputFile: {
			junit: "./test_report/junit.xml",
		},
	},
});
