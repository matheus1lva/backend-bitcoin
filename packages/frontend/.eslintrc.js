module.exports = {
  extends: [
    "../../.eslintrc.js",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:import/recommended",
  ],
  plugins: ["react", "react-hooks", "jsx-a11y", "import"],
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  settings: {
    react: {
      version: "detect",
    },
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx"],
      },
    },
  },
  rules: {
    // React specific rules
    "react/prop-types": "error",
    "react/jsx-uses-react": "error",
    "react/jsx-uses-vars": "error",
    "react/react-in-jsx-scope": "off", // Not needed in React 17+
    "react/jsx-filename-extension": ["error", { extensions: [".jsx"] }],
    "react/jsx-no-bind": ["error", { allowArrowFunctions: true }],
    "react/jsx-pascal-case": "error",
    "react/no-array-index-key": "warn",

    // React Hooks rules
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",

    // Import rules
    "import/first": "error",
    "import/no-duplicates": "error",
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
        ],
        "newlines-between": "always",
        alphabetize: { order: "asc" },
      },
    ],

    // Accessibility rules
    "jsx-a11y/anchor-is-valid": "error",
    "jsx-a11y/click-events-have-key-events": "error",
    "jsx-a11y/no-static-element-interactions": "error",
  },
};
