import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  externals: ['vue', 'zod'],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
  },
})
