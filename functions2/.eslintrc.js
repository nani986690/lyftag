module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    indent: "off",
    "comma-dangle": "off",
    "padded-blocks": "off",
    "object-curly-spacing": "off",
  },
};
