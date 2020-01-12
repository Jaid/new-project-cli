# new-project-cli


<a href="https://raw.githubusercontent.com/Jaid/new-project-cli/master/license.txt"><img src="https://img.shields.io/github/license/Jaid/new-project-cli?style=flat-square" alt="License"/></a>  
<a href="https://actions-badge.atrox.dev/Jaid/new-project-cli/goto"><img src="https://img.shields.io/endpoint.svg?style=flat-square&url=https%3A%2F%2Factions-badge.atrox.dev%2FJaid%2Fnew-project-cli%2Fbadge" alt="Build status"/></a> <a href="https://github.com/Jaid/new-project-cli/commits"><img src="https://img.shields.io/github/commits-since/Jaid/new-project-cli/v2.0.0?style=flat-square&logo=github" alt="Commits since v2.0.0"/></a> <a href="https://github.com/Jaid/new-project-cli/commits"><img src="https://img.shields.io/github/last-commit/Jaid/new-project-cli?style=flat-square&logo=github" alt="Last commit"/></a> <a href="https://github.com/Jaid/new-project-cli/issues"><img src="https://img.shields.io/github/issues/Jaid/new-project-cli?style=flat-square&logo=github" alt="Issues"/></a>  
<a href="https://npmjs.com/package/new-project-cli"><img src="https://img.shields.io/npm/v/new-project-cli?style=flat-square&logo=npm&label=latest%20version" alt="Latest version on npm"/></a> <a href="https://github.com/Jaid/new-project-cli/network/dependents"><img src="https://img.shields.io/librariesio/dependents/npm/new-project-cli?style=flat-square&logo=npm" alt="Dependents"/></a> <a href="https://npmjs.com/package/new-project-cli"><img src="https://img.shields.io/npm/dm/new-project-cli?style=flat-square&logo=npm" alt="Downloads"/></a>

**CLI tool that creates a new GitHub repository for an npm package.**

#### Opinionated

This project is tailored to my personal needs and workflows and therefore highly opinionated. Feel free to use it or get inspired by it, but please do not get frustrated if you come across weird features or have difficulties integrating it in your own ecosystem.














## Installation
<a href="https://npmjs.com/package/new-project-cli"><img src="https://img.shields.io/badge/npm-new--project--cli-C23039?style=flat-square&logo=npm" alt="new-project-cli on npm"/></a>
```bash
npm install --global new-project-cli@^2.0.0
```
<a href="https://yarnpkg.com/package/new-project-cli"><img src="https://img.shields.io/badge/Yarn-new--project--cli-2F8CB7?style=flat-square&logo=yarn&logoColor=white" alt="new-project-cli on Yarn"/></a>
```bash
yarn global add new-project-cli@^2.0.0
```




## CLI Usage
After installing package `new-project-cli` globally, you can use its command line interface.
```bash
new-project-cli my-new-package --description "Description of package." --template epoch-seconds
```
For usage instructions:
```bash
new-project-cli --help
```




## Development



Setting up:
```bash
git clone git@github.com:Jaid/new-project-cli.git
cd new-project-cli
npm install
```
Testing:
```bash
npm run test:dev
```
Testing in production environment:
```bash
npm run test
```


## License
```text
MIT License

Copyright © 2020, Jaid <jaid.jsx@gmail.com> (github.com/jaid)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
