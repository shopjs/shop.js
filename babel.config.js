module.exports = (api) => {
  api.cache(true)

  return {
    presets: [
      [
        '@babel/preset-env',
        {
          modules: false,
        }
      ],
    ],
    plugins: [
      'transform-react-pug',
      '@babel/transform-react-jsx',
      ['@babel/plugin-proposal-decorators', { 'legacy': true }],
      ['@babel/plugin-proposal-class-properties', { 'loose': true }],
      [
        'styled-jsx/babel',
        { plugins: ['styled-jsx-plugin-stylus'] }
      ]
    ],
    // ignore: [/node_modules\/(?!.*d3.*)/],
  }
}
