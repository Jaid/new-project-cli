import fsp from "@absolunet/fsp"
import {camelCase} from "camel-case"
import {constantCase} from "constant-case"
import ensureArray from "ensure-array"
import escapeStringRegexp from "escape-string-regexp"
import execa from "execa"
import fetchGitRepo from "fetch-git-repo"
import handlebars from "handlebars"
import hasContent, {isEmpty} from "has-content"
import {headerCase} from "header-case"
import isGitRepoDirty from "is-git-repo-dirty"
import ms from "ms.macro"
import npmCheckUpdates from "npm-check-updates"
import npmNameExists from "npm-name-exists"
import open from "open"
import {pascalCase} from "pascal-case"
import path from "path"
import replaceInFile from "replace-in-file"
import simpleGit from "simple-git/promise"
import validateNpmPackageName from "validate-npm-package-name"

import config from "lib/config"
import logger from "lib/logger"

/**
 * @typedef {Object} Argv
 * @prop {string} projectName
 * @prop {string} description
 * @prop {string} hubPath
 * @prop {string} codePath
 * @prop {string} npmPath
 * @prop {boolean} skipNameCheck
 * @prop {string} projectsFolder
 * @prop {string} template
 * @prop {string} initialVersion
 * @prop {boolean} privateRepo
 * @prop {string} owner
 */

/**
 * @param {import("yargs").Arguments<Argv>} argv
 * @return {Promise<void>}
 */
export default async argv => {
  if (isEmpty(argv.argv.projectName)) {
    logger.warn("Given project name is empty")
    process.exit(1)
  }

  if (!argv.skipNameCheck) {
    const validationResult = validateNpmPackageName(argv.projectName)
    const validationErrors = [
      ...validationResult.warnings || [],
      ...validationResult.errors || [],
    ]
    if (hasContent(validationErrors)) {
      logger.error("Invalid npm package name %s", argv.projectName)
      for (const validationError of validationErrors) {
        logger.error(validationError)
      }
      process.exit(1)
    }
    const packageNameExists = await npmNameExists(argv.projectName)
    if (packageNameExists) {
      logger.error(`Already exists: https://yarnpkg.com/package/${argv.projectName}`)
      process.exit(1)
    }
  }

  const projectsFolder = path.resolve(argv.projectsFolder)
  const projectDir = path.join(projectsFolder, argv.projectName)

  const projectDirExists = await fsp.pathExists(projectDir)
  if (projectDirExists) {
    logger.error(`${projectDir} already exists!`)
    process.exit(1)
  }

  const resolveHandlebars = templateString => {
    return handlebars.compile(templateString, {noEscape: true})({
      owner: argv.owner,
      template: argv.template,
      initialVersion: argv.initialVersion,
      projectName: argv.projectName,
    })
  }

  const resolvedDescription = argv.description || resolveHandlebars(config.description)

  const cloneId = `${argv.owner}/${argv.template}`
  logger.info(`Cloning from ${cloneId}`)
  await fetchGitRepo(`${argv.owner}/${argv.template}`, projectDir)

  logger.info("Transforming file contents")
  await fsp.writeFile(path.join(projectDir, "readme.md"), resolveHandlebars(config.readme))

  const pkgFile = path.join(projectDir, "package.json")
  const pkg = await fsp.readJson(pkgFile)
  pkg.description = resolvedDescription
  pkg.version = argv.initialVersion
  await fsp.writeJson(pkgFile, pkg)

  await replaceInFile({
    files: path.join(projectDir, "**"),
    from: [
      new RegExp(escapeStringRegexp(argv.template), "g"),
      new RegExp(escapeStringRegexp(camelCase(argv.template)), "g"),
      new RegExp(escapeStringRegexp(pascalCase(argv.template)), "g"),
      new RegExp(escapeStringRegexp(constantCase(argv.template)), "g"),
      new RegExp(escapeStringRegexp(headerCase(argv.template)), "g"),
    ],
    to: [
      argv.projectName,
      camelCase(argv.projectName),
      pascalCase(argv.projectName),
      constantCase(argv.projectName),
      headerCase(argv.projectName),
    ],
  })

  logger.info("Creating git repository")
  const gitRepository = simpleGit(projectDir)
  await gitRepository.init()

  await gitRepository.add(projectDir)
  await gitRepository.commit(resolveHandlebars(config.initialCommitMessage))
  await execa(argv.npmPath, ["install"], {
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
  await execa(argv.npmPath, ["install"], {
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

  await execa(argv.hubPath, [
    "create",
    ...argv.privateRepo ? ["--private"] : [],
    "-d",
    resolvedDescription,
    "-h",
    `https://github.com/${argv.owner}/${argv.projectName}`,
  ], {
    cwd: projectDir,
  })
  await execa(argv.hubPath, [
    "push",
    "--set-upstream",
    "origin",
    "master",
  ], {
    cwd: projectDir,
  })
  await execa(argv.codePath, ["--new-window", projectDir])
  for (const url of ensureArray(config.openUrls)) {
    open(resolveHandlebars(url), {})
  }
}