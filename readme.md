# new-project-cli


<a href="https://raw.githubusercontent.com/jaid/new-project-cli/master/license.txt"><img src="https://img.shields.io/github/license/jaid/new-project-cli?style=flat-square" alt="License"/></a> <a href="https://github.com/sponsors/jaid"><img src="https://img.shields.io/badge/<3-Sponsor-FF45F1?style=flat-square" alt="Sponsor new-project-cli"/></a>  
<a href="https://actions-badge.atrox.dev/jaid/new-project-cli/goto"><img src="https://img.shields.io/endpoint.svg?style=flat-square&url=https%3A%2F%2Factions-badge.atrox.dev%2Fjaid%2Fnew-project-cli%2Fbadge" alt="Build status"/></a> <a href="https://github.com/jaid/new-project-cli/commits"><img src="https://img.shields.io/github/commits-since/jaid/new-project-cli/v3.1.0?style=flat-square&logo=github" alt="Commits since v3.1.0"/></a> <a href="https://github.com/jaid/new-project-cli/commits"><img src="https://img.shields.io/github/last-commit/jaid/new-project-cli?style=flat-square&logo=github" alt="Last commit"/></a> <a href="https://github.com/jaid/new-project-cli/issues"><img src="https://img.shields.io/github/issues/jaid/new-project-cli?style=flat-square&logo=github" alt="Issues"/></a>  
<a href="https://npmjs.com/package/new-project-cli"><img src="https://img.shields.io/npm/v/new-project-cli?style=flat-square&logo=npm&label=latest%20version" alt="Latest version on npm"/></a> <a href="https://github.com/jaid/new-project-cli/network/dependents"><img src="https://img.shields.io/librariesio/dependents/npm/new-project-cli?style=flat-square&logo=npm" alt="Dependents"/></a> <a href="https://npmjs.com/package/new-project-cli"><img src="https://img.shields.io/npm/dm/new-project-cli?style=flat-square&logo=npm" alt="Downloads"/></a>

**Opinionated command line tool that creates a new git repository for an npm package.**

#### Opinionated

This project is tailored to my personal needs and workflows and therefore highly opinionated. Feel free to use it or get inspired by it, but please do not get frustrated if you come across weird features or have difficulties integrating it in your own ecosystem.




## Installation

<a href="https://npmjs.com/package/new-project-cli"><img src="https://img.shields.io/badge/npm-new--project--cli-C23039?style=flat-square&logo=npm" alt="new-project-cli on npm"/></a>

```bash
npm install --global new-project-cli@^3.1.0
```

<a href="https://yarnpkg.com/package/new-project-cli"><img src="https://img.shields.io/badge/Yarn-new--project--cli-2F8CB7?style=flat-square&logo=yarn&logoColor=white" alt="new-project-cli on Yarn"/></a>

```bash
yarn global add new-project-cli@^3.1.0
```

<a href="https://github.com/jaid/new-project-cli/packages"><img src="https://img.shields.io/badge/GitHub Packages-@jaid/new--project--cli-24282e?style=flat-square&logo=github" alt="@jaid/new-project-cli on GitHub Packages"/></a>  
(if [configured properly](https://help.github.com/en/github/managing-packages-with-github-packages/configuring-npm-for-use-with-github-packages))

```bash
npm install --global @jaid/new-project-cli@^3.1.0
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
git clone git@github.com:jaid/new-project-cli.git
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
[MIT License](https://raw.githubusercontent.com/jaid/new-project-cli/master/license.txt)  
Copyright © 2020, Jaid \<jaid.jsx@gmail.com> (https://github.com/jaid)
