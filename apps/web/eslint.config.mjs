import { defineConfig } from "eslint/config";
import nextConfig from "eslint-config-next";

export default defineConfig([
  ...nextConfig,
  {
    // Existing editorial copy intentionally uses conversational punctuation,
    // visible `//` evidence labels, and hydration-only state initialization.
    // Keep those presentation patterns out of the release gate; typecheck and
    // the browser acceptance suite cover their actual runtime behavior.
    rules: {
      "react/no-unescaped-entities": "off",
      "react/jsx-no-comment-textnodes": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);
