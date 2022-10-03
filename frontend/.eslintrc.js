module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 13,
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  rules: {
    'react/function-component-definition': 'off',
    camelcase: 'off',
    'no-restricted-syntax': 'off',
    'no-mixed-operators': 'off',
    'react/prop-types': 'off',
    'react/destructuring-assignment': 'off',
    'react/jsx-filename-extension': 'off',
    'max-len': 'off',
    'react/state-in-constructor': 'off',
    eqeqeq: 'off',
    'no-param-reassign': 'off',
    'no-shadow': 'off',
    'no-prototype-builtins': 'off',
    'jsx-a11y/label-has-associated-control': 'off',
    'react/no-access-state-in-setstate': 'off',
    'react/jsx-no-bind': 'off',
    'class-methods-use-this': 'off',
    'react/no-unstable-nested-components': 'off',
    'react/sort-comp': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
  },
};
