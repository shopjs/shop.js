# 📚 rollup-jest-boilerplate

> Full featured boilerplate for building JavaScript libraries the modern way.

## Features
- 📜 [Rollup.js](https://rollupjs.org/guide/en) configuration providing compatibility with different module systems (CommonJS, ECMAScript, UMD for `<script>` tags)
- 🃏 [Jest](http://jestjs.io/) setup with watch mode working
- 🛀 [Renovate](https://github.com/apps/renovate) configuration for auto updates (you have to activate it via https://github.com/apps/renovate)
- ✅ [Travis CI](https://travis-ci.com/)
- 🏗 [.nvmrc](https://github.com/creationix/nvm) file to enforce the Node.js version for contributors and continuous integration
- ⚡️ Ready to publish and use

## How to use

Decide of a new library name, let's say `new-super-library` (🤦🏼‍♀️), then in a terminal:

```sh
curl --output rollup-jest-boilerplate.zip -LOk https://github.com/algolia/rollup-jest-boilerplate/archive/master.zip
unzip rollup-jest-boilerplate.zip
rm rollup-jest-boilerplate.zip
mv rollup-jest-boilerplate-master new-super-library
```

**Next steps:**
- search the project for `rollup-starter-lib` and replace everywhere with `new-super-library`
- start coding in [src/index.js](src/index.js)
- profit 💸

## Live examples

Those examples are using the live published version of this boilerplate library on [npm](https://www.npmjs.com/rollup-jest-boilerplate) and they run with [CodeSandbox](https://codesandbox.io/).

- [ECMAScript](https://codesandbox.io/s/7ojknnqjl6?module=%2Fsrc%2Findex.js)
- [CommonJS](https://codesandbox.io/s/o5q018q609?module=%2Fsrc%2Findex.js)
- [UMD](https://codesandbox.io/s/jyqqp21rv), this leverages [jsDelivr npm CDN](https://www.jsdelivr.com/features)

## Developer environment requirements

To run this project, you will need:

- Node.js >= v10.5.0, use nvm - [install instructions](https://github.com/creationix/nvm#install-script)

## Running tests

```sh
npm
npm test
npm test --watch
```

## Dev mode

When developing you can run:

```
npm run watch
```

This will regenerate the build files each time a source file is changed and serve on http://127.0.0.1:5000.

### Previewing umd build in the browser

If your package works in the browser, you can open `dev/index.html` to try it out.

## Publishing

```sh
npm publish
```

## Additional tooling

Based on your need, you might want to add:
- [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/)
- [TypeScript](https://www.typescriptlang.org/) support
- Monorepo support with [Lerna](https://lernajs.io/)
- CHANGELOG.md generation with [conventional-changelog](https://github.com/conventional-changelog)

If so, please do and open pull requests when you feel like it.

## Original idea

I initially used [rollup/rollup-starter-lib](https://github.com/rollup/rollup-starter-lib) but really needed that Jest support so I did it.
