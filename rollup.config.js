import fs from 'fs'

import autoprefixer from 'autoprefixer'
import nodeEval from 'node-eval'
import url from 'postcss-url'
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import filesize from 'rollup-plugin-filesize'
import json from 'rollup-plugin-json'
import resolve from 'rollup-plugin-node-resolve'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import postcss from 'rollup-plugin-postcss'
import visualizer from 'rollup-plugin-visualizer'

import pkg from './package.json'

export function getModuleExports(moduleId) {
  const id = require.resolve(moduleId)
  const moduleOut = nodeEval(fs.readFileSync(id).toString(), id)
  let result = []
  const excludeExports = /^(default|__)/
  if (moduleOut && typeof moduleOut === 'object') {
    result = Object.keys(moduleOut)
      .filter((name) => !excludeExports.test(name))
  }

  return result
}

export function getNamedExports(moduleIds) {
  const result = {}
  moduleIds.forEach((id) => {
    result[id] = getModuleExports(id)
  })
  return result
}

const plugins = [
  peerDepsExternal(),
  json({
    // All JSON files will be parsed by default,
    // but you can also specifically include/exclude files
    include: 'node_modules/**',

    // for tree-shaking, properties will be declared as
    // variables, using either `var` or `const`
    preferConst: true, // Default: false

    // specify indentation for the generated default export —
    // defaults to '\t'
    indent: '  ',

    // ignores indent and generates the smallest code
    compact: true, // Default: false

    // generate a named export for every property of the JSON object
    namedExports: true, // Default: true
  }),
  postcss({
    extract: 'index.css',
    plugins: [
      url({
        url: 'inline',
      }),
      autoprefixer,
    ],
  }),
  resolve({
    extensions: ['.mjs', '.js', '.jsx', '.json'],
  }),
  babel({
    exclude: 'node_modules/**',
  }),
  commonjs({
    namedExports: getNamedExports(['react', 'react-is', 'prop-types', 'lodash']),
  }),
  filesize(),
  visualizer(),
]

const globals = {
  // 'react': 'React',
  // 'react-dom': 'ReactDOM',
}

export default [
  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // an array for the `output` option, where we can specify
  // `file` and `format` for each target)
  {
    input: 'src/index.js',
    external: [
      // 'react',
      // 'react-dom',
    ],
    plugins,
    output: [
      {
        name: 'react',
        file: pkg.browser,
        format: 'umd',
        sourcemap: true,
        globals,
      },
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
        globals,
      },
      {
        file: pkg.module,
        format: 'es',
        sourcemap: true,
        globals,
      },
    ],
  },
]
