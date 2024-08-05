module.exports = {
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "airbnb-base",
  ],
  plugins: ["@typescript-eslint"],
  rules: {
    // カスタムルールを追加できます
  },
  env: {
    node: true,
    es6: true,
  },
};
