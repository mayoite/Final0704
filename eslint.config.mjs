import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";

function stripReactRules(config) {
  if (!config || typeof config !== "object" || !("rules" in config) || !config.rules) {
    return config;
  }

  return {
    ...config,
    rules: Object.fromEntries(Object.entries(config.rules).filter(([ruleName]) => !ruleName.startsWith("react/"))),
  };
}

const eslintConfig = defineConfig([
  ...nextVitals.map(stripReactRules),
  ...nextTs.map(stripReactRules),
  {
    files: [
      "src/components/smartdraw/**/*.{js,jsx,ts,tsx,mjs,cjs}",
      "src/app/smartdraw/**/*.{js,jsx,ts,tsx,mjs,cjs}",
      "src/components/planner/**/*.{js,jsx,ts,tsx,mjs,cjs}",
      "src/app/planner/**/*.{js,jsx,ts,tsx,mjs,cjs}",
    ],
    plugins: { "better-tailwindcss": betterTailwindcss },
    settings: {
      "better-tailwindcss": {
        entryPoint: "./src/app/globals.css",
        tsconfig: "./tsconfig.json",
      },
    },
    rules: {
      "better-tailwindcss/no-conflicting-classes": "off",
      "better-tailwindcss/no-duplicate-classes": "warn",
      "better-tailwindcss/enforce-consistent-class-order": "warn",
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "react/display-name": "off",
      "react/no-direct-mutation-state": "off",
      "react/no-render-return-value": "off",
      "react/jsx-no-target-blank": "off",
      "react/jsx-key": "off",
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "react/no-unescaped-entities": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "oando_assets/**",
    ".lh-*/**",
    ".vercel/**",
    "playwright-report/**",
    "test-results/**",
    "coverage/**",
    ".claude/**",
    ".continue/**",
    ".playwright-mcp/**",
    "public/**/*.js",
    "public/**/*.map",
    "tmp/**",
  ]),
]);

export default eslintConfig;
