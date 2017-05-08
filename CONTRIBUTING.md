# How to contribute

Community involvement is essential to the success of [Shop.js][shopjs] and the rest of the Hanzo ecosystem.
To make changes and get them into the library, here are some guidelines to make that process
smooth for all involved.

## Reporting issues

To report a bug, request a feature, or even ask a question, make use of the GitHub Issues
section for [Shop.js][issues]. When submitting an issue please take the following steps:

1. **Seach for existing issues.** Your question or bug may have already been answered or fixed,
be sure to search the issues first before putting in a duplicate issue.

2. **Create an isolated and reproducible test case.** If you are reporting a bug, make sure you
also have a minimal, runnable, code example that reproduces the problem you have.

3. **Include a live example.** After narrowing your code down to only the problem areas, make use
of [jsFiddle][fiddle], [jsBin][jsbin], or a link to your live site so that we can view a live example of the problem.

4. **Share as much information as possible.** Include browser version affected, your OS, version of
the library, steps to reproduce, etc. "X isn't working!!!1!" will probably just be closed.

## Contributing Changes

### Setting Up

To setup for making changes you will need to take a few steps, we've outlined them below:

1. Ensure you have node.js installed. You can download Node.js from [nodejs.org][node]. Because
Shop.js uses modern JS features, you will need a modern version of Node. v7+ is recommended.

2. Fork the [Shop.js][shop] repository, if you are unsure how to do this GitHub has a guides
for the [command line][fork-cli] and for the [GitHub Client][fork-gui].

3. Next, run `npm install` from within your clone of your fork. That will install dependencies
necessary to build Shop.js


### Making a Change

Once you have Node.js, the repository, and have installed dependencies are you almost ready to make your
change. The only other thing before you start is to checkout the correct branch. Your change should be 
made directly to the branch in your fork, or to a branch in your fork made off of master.

### Submitting Your Change

After you have made and tested your change, commit and push it to your fork. Then, open a Pull Request
from your fork to the main shop.js repository on the branch you used in the `Making a Change` section of this document.

## Code Style Guide

- Use 2 spaces for tabs, never tab characters.
- No trailing whitespace, blank lines should have no whitespace.

[shopjs]: https://github.com/hanzo.io/shop.js
[issues]: https://github.com/hanzo-io/shop.js/issues
[shop]: https://github.com/hanzo-io/shop.js
[fiddle]: http://jsfiddle.net
[jsbin]: http://jsbin.com/
[node]: http://nodejs.org
[fork-cli]: https://help.github.com/articles/fork-a-repo/
[fork-gui]: https://guides.github.com/activities/forking/

## Contributor Code of Conduct
[Contributor Covenant, version 1.4](http://contributor-covenant.org/version/1/4)
