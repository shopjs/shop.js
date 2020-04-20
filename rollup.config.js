import pkg from './package.json'

import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'

import filesize from 'rollup-plugin-filesize'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import typescript from 'rollup-plugin-typescript2'
import visualizer from 'rollup-plugin-visualizer'

import fs from 'fs'
import nodeEval from 'node-eval'

const extensions = [
  '.js', '.jsx', '.ts', '.tsx', 'json',
]

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

// Helper for getting the names exports automagically
export function getNamedExports(moduleIds) {
  const result = {}
  moduleIds.forEach( (id) => {
      result[id] = getModuleExports(id)
  })
  return result
}

const plugins = [
  peerDepsExternal(),
  resolve({
    extensions,
    preferBuiltins: true,
  }),
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
    namedExports: true // Default: true
  }),
  typescript(),
  commonjs({
    include: 'node_modules/**',
    namedExports: {
      'node_modules/react-is/index.js': ['isFragment', 'ForwardRef', 'Memo'],
      'node_modules/prop-types/index.js': ['elementType'],
      'node_modules/react-virtualized/dist/es/WindowScroller/WindowScroller.js': ['bpfrpt_proptype_WindowScroller'],
    }
  }),
  filesize(),
  visualizer(),
]

export default [
  // source
  {
    input: 'src/index.ts',
    external: [],
    plugins,
    output: [
      { name: pkg.name, file: pkg.browser, format: 'umd', sourcemap: true },
      // { file: pkg.main, format: 'cjs', sourcemap: true },
      // { file: pkg.module, format: 'es', sourcemap: true },
    ],
  },
]
