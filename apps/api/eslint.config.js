import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    files: ["**/*.js", "**/*.mjs"],
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
      "no-undef": "error"
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        process: "readonly",
        console: "readonly",
        Buffer: "readonly",
        URL: "readonly",
        __dirname: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly"
      }
    }
  }
];
