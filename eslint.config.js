import WisemenEslintConfig from '@wisemen/eslint-config-vue'

export default [
  ...(await WisemenEslintConfig),
  {
    rules: {
      'require-explicit-generics/require-explicit-generics': 'off',
      'ts/explicit-function-return-type': 'off',
    },
  },

]
