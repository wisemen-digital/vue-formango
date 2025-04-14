import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  clean: true,
  declaration: true,
  entries: [
    'src/index',
  ],
  externals: [
    'vue',
    'zod',
  ],
  rollup: { emitCJS: true },
})
