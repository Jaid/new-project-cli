import path from "path"

import yargs from "yargs"
import fsp from "@absolunet/fsp"
import execa from "execa"
import simpleGit from "simple-git/promise"
import npmCheckUpdates from "npm-check-updates"
import whichPromise from "which-promise"
import config from "lib/config"
import logger from "lib/logger"
import npmNameExists from "npm-name-exists"
import hasContent, {isEmpty} from "has-content"
import validateNpmPackageName from "validate-npm-package-name"
import handlebars from "handlebars"
import constantCase from "constant-case"
import headerCase from "header-case"
import camelCase from "camel-case"
import ensureArray from "ensure-array"
import open from "open"
import replaceInFile from "replace-in-file"
import escapeStringRegexp from "escape-string-regexp"
import pascalCase from "pascal-case"
import fetchGitRepo from "fetch-git-repo"
import ms from "ms.macro"
import isGitRepoDirty from "is-git-repo-dirty"

const job = async ({projectName, description, hubPath, codePath, npmPath, skipNameCheck, projectsFolder, template, initialVersion, privateRepo, owner}) => {
  if (isEmpty(projectName)) {
    logger.warn("Given project name is empty")
    process.exit(1)
  }

  if (!skipNameCheck) {
    const validationResult = validateNpmPackageName(projectName)
    const validationErrors = [
      ...validationResult.warnings || [],
      ...validationResult.errors || [],
    ]
    if (validationErrors |> hasContent) {
      logger.error("Invalid npm package name %s", projectName)
      for (const validationError of validationErrors) {
        logger.error(validationError)
      }
      process.exit(1)
    }
    const packageNameExists = await npmNameExists(projectName)
    if (packageNameExists) {
      logger.error(`Already exists: https://yarnpkg.com/package/${projectName}`)
      process.exit(1)
    }
  }

  projectsFolder = path.resolve(projectsFolder)
  const projectDir = path.join(projectsFolder, projectName)

  const projectDirExists = await fsp.pathExists(projectDir)
  if (projectDirExists) {
    logger.error(`${projectDir} already exists!`)
    process.exit(1)
  }

  const resolveHandlebars = templateString => {
    return handlebars.compile(templateString, {noEscape: true})({
      owner,
      template,
      initialVersion,
      projectName,
    })
  }

  const cloneId = `${owner}/${template}`
  logger.info(`Cloning from ${cloneId}`)
  await fetchGitRepo(`${owner}/${template}`, projectDir)

  logger.info("Transforming file contents")
  await Promise.all([
    fsp.writeFile(path.join(projectDir, "readme.md"), resolveHandlebars(config.readme)),
    replaceInFile({
      files: path.join(projectDir, "package.json"),
      from: /"version": "\d+\.\d+\.\d+"/,
      to: `"version": "${initialVersion}"`,
    }),
  ])

  await replaceInFile({
    files: path.join(projectDir, "**"),
    from: [
      new RegExp(escapeStringRegexp(template), "g"),
      new RegExp(escapeStringRegexp(template |> camelCase), "g"),
      new RegExp(escapeStringRegexp(template |> pascalCase), "g"),
      new RegExp(escapeStringRegexp(template |> constantCase), "g"),
      new RegExp(escapeStringRegexp(template |> headerCase), "g"),
    ],
    to: [
      projectName,
      projectName |> camelCase,
      projectName |> pascalCase,
      projectName |> constantCase,
      projectName |> headerCase,
    ],
  })

  logger.info("Creating git repository")
  const gitRepository = simpleGit(projectDir)
  await gitRepository.init()

  await gitRepository.add(projectDir)
  await gitRepository.commit(resolveHandlebars(config.initialCommitMessage))
  await execa(npmPath, ["install"], {
    cwd: projectDir,
    env: {
      NODE_ENV: "development",
    },
  })
  await gitRepository.add(projectDir)
  await gitRepository.commit(resolveHandlebars(config.lockfileCreationCommitMessage))

  logger.info("Upgrading dependencies")
  await npmCheckUpdates.run({
    jsonUpgraded: true,
    packageManager: "npm",
    upgrade: true,
    timeout: ms`5 minutes`,
    silent: true,
    packageFile: path.join(projectDir, "package.json"),
    packageFileDir: projectDir,
  })
  logger.info("Installing dependencies again")
  await execa(npmPath, ["install"], {
    cwd: projectDir,
    env: {
      NODE_ENV: "development",
    },
  })
  const isDirty = await isGitRepoDirty(projectDir)
  if (isDirty) {
    await gitRepository.add(projectDir)
    const commitMessage = resolveHandlebars(config.upgradeCommitMessage)
    logger.info(`Commit: ${commitMessage}`)
    await gitRepository.commit(commitMessage)
  }

  await execa(hubPath, [
    "create",
    ...privateRepo ? ["--private"] : [],
    "-d",
    description || resolveHandlebars(config.description),
    "-h",
    `https://github.com/${owner}/${projectName}`,
  ], {
    cwd: projectDir,
  })
  await execa(hubPath, [
    "push",
    "--set-upstream",
    "origin",
    "master",
  ], {
    cwd: projectDir,
  })
  await execa(codePath, ["--new-window", projectDir])
  for (const url of ensureArray(config.openUrls)) {
    open(resolveHandlebars(url), {})
  }
}

const main = async () => {
  const [codePath, hubPath, npmPath] = await Promise.all([
    whichPromise("code"),
    whichPromise("hub"),
    whichPromise("npm"),
  ])
  const builder = {
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
      default: false,
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
      default: false,
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
    .scriptName("new-project")
    .version(_PKG_VERSION)
    .command("$0 <projectName>", "Creates a new project based of an existing repo", builder, job).argv
}

main()