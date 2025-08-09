import importPlugin from "eslint-plugin-import";
import prettierPlugin from "eslint-plugin-prettier";
import tsPlugin from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

export default [
  prettierConfig,
  ...tsPlugin.configs.recommended,
  {
    files: ["**/*.{js,ts,mjs,cjs}"],
    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
          alwaysTryTypes: true,
        },
        node: true,
      },
    },
    plugins: {
      import: importPlugin,
      prettier: prettierPlugin,
    },
  },
  {
    ignores: ["**/node_modules/", ".sst/", ".build", "coverage/"],
  },
];
