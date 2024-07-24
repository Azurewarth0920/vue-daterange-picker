import babel from '@rollup/plugin-babel'
import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'
import pkg from '../../package.json' with { type: "json" };
import resolve from '@rollup/plugin-node-resolve'

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.module,
        format: 'es',
        sourcemap: true,
        plugins: [terser()],
      },
    ],
    external: ['vue'],
    plugins: [
      typescript({
        sourceMap: true,
      }),
      babel({
        babelHelpers: 'bundled',
        extensions: ['.ts', '.tsx'],
        plugins: ['@vue/babel-plugin-jsx'],
      }),
    ],
  },
  {
    input: 'src/index.ts',
    output: [
      {
        name: 'rangeCalendar',
        file: pkg.exports['.'].require,
        format: 'cjs',
        exports: 'named',
        plugins: [terser()],
      },
    ],
    external: ['vue'],
    plugins: [
      typescript({
        sourceMap: false,
      }),
      babel({
        babelHelpers: 'bundled',
        extensions: ['.ts', '.tsx'],
        plugins: ['@vue/babel-plugin-jsx'],
      }),
      resolve(),
    ],
  },
]
