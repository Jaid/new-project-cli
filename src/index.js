import whichPromise from "which-promise"
import yargs from "yargs"

import config from "lib/config"

import handleCommand from "src/main"

const main = async () => {
  const [codePath, hubPath, npmPath] = await Promise.all([
    whichPromise("code"),
    whichPromise("hub"),
    whichPromise("npm"),
  ])
  /**
   * @type {import("yargs").CommandBuilder}
   */
  const commandBuilder = {
    "code-path": {
      type: "string",
      default: codePath,
      description: "Path to the VSCode binary",
    },
    "hub-path": {
      type: "string",
      default: hubPath,
      description: "Path to Hub (GitHub wrapper) binary",
    },
    "npm-path": {
      type: "string",
      default: npmPath,
      description: "Path to npm binary",
    },
    "skip-name-check": {
      type: "boolean",
      description: "Skip checking if name is taken on npm",
    },
    "projects-folder": {
      type: "string",
      default: config.projectsFolder,
    },
    template: {
      type: "string",
      default: config.template,
      description: "Name of the template repository",
    },
    "initial-version": {
      type: "string",
      default: "0.1.0",
      description: "Version field in new package.json",
    },
    "private-repo": {
      type: "boolean",
      description: "Initialize private GitHub repository instead of public",
    },
    owner: {
      type: "string",
      default: config.githubUser,
      description: "Username of GitHub account",
    },
    description: {
      type: "string",
      description: "Description for GitHub",
    },
  }
  yargs
    .scriptName(process.env.REPLACE_PKG_NAME)
    .version(process.env.REPLACE_PKG_VERSION)
    .command("* <projectName>", process.env.REPLACE_PKG_DESCRIPTION, commandBuilder, handleCommand)
    .parse()
}

main()