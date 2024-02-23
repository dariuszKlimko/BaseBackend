module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  plugins: ["@typescript-eslint/eslint-plugin"],
  env: {
    node: true,
    es6: true,
    jest: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
    project: "tsconfig.json",
  },
  rules: {
    semi: ["off"],
    quotes: ["error", "double", { allowTemplateLiterals: true, avoidEscape: false }],
    "prefer-const": "error",
    "comma-dangle": ["warn", "only-multiline"],
    // do not allow relative path import. only import from @app/*
    "no-restricted-imports": ["error", { patterns: ["./*", "../*"] }],
    "@typescript-eslint/explicit-function-return-type": ["error", { allowExpressions: true }],
    "@typescript-eslint/no-explicit-any": 1,
    "@typescript-eslint/semi": ["error", "always"],
    // "@typescript-eslint/no-inferrable-types": [
    //   "warn",
    //   {
    //     ignoreParameters: true,
    //   },
    // ],
    "@typescript-eslint/no-inferrable-types": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-empty-interface": [
      "error",
      {
        "allowSingleExtends": true
      }
    ]
  },
  ignorePatterns: [".eslintrc.js"],
};
