import { defineBuildConfig } from 'unbuild'
import copy from 'rollup-plugin-copy'

export default defineBuildConfig({
  entries: ['src/index'],
  clean: true,
  declaration: true,
  failOnWarn: false,
  rollup: {
    inlineDependencies: true,
    esbuild: {
      minify: true,
    },
  },
  hooks: {
    'rollup:options': (ctx, options) => {
      options.plugins = [
        ...options.plugins as [],
        copy({
          targets: [
            {
              src: ['templates', 'package.json', 'README.md'],
              dest: 'dist'
            },
          ]
        })
      ]
    }
  }
})
