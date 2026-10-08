import js from "@eslint/js";
import tseslint from "typescript-eslint";
import hooks from "eslint-plugin-react-hooks";
import globals from "globals";
export default tseslint.config(
  { files: ["public/*.js"], languageOptions: { globals: globals.browser } },
  { ignores: ["dist", "node_modules", "docs/design"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: { globals: globals.browser },
    plugins: { "react-hooks": hooks },
    rules: {
      ...hooks.configs.recommended.rules,
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    files: ["scripts/**/*.mjs", "*.js", "*.ts", "tests/**/*.ts"],
    languageOptions: { globals: globals.node },
  },
);
