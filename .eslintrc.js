module.exports = {
  extends: ["eslint-config-react-app", "react-app"],
  rules: {
    "object-curly-spacing": ["error", "always"],
    "no-trailing-spaces": ["error", { ignoreComments: true }],
    "no-multiple-empty-lines": ["error", { max: 1 }],
    indent: ["error", 2],
    "no-console": "warn",
    // "no-script-url": "warn",
    "jsx-a11y/anchor-is-valid": "warn",
    "jsx-quotes": [1, "prefer-double"],
  },
};
