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
 * @typedef {import("src/main").Argv} Parameter
 * @prop {string} projectDir
 */

/**
 * @typedef {Object} Result
 * @prop {"ok"|"unknown"|"emptyName"|"invalidNpmName"|"alreadyExistsOnNpm"|"dirAlreadyExists"|"unknownError"|"couldNotClone"} status
 * @prop {number} exitCode
 * @prop {string} projectsFolder
 * @prop {string} projectDir
 * @prop {boolean} createdDir
 */

/**
 * @param {Parameter} argv
 * @return {Promise<Result>}
 */
export default async argv => {
  const projectsFolder = path.resolve(argv.projectsFolder)
  const projectDir = path.join(projectsFolder, argv.projectName)

  logger.info(`Project: ${argv.projectName}`)
  logger.info(`New folder: ${projectDir}`)
  if (argv.template) {
    logger.info(`Template: ${argv.template}`)
  }

  /**
   * @type {Result}
   */
  const result = {
    status: "unknown",
    exitCode: 1,
    createdDir: false,
    projectsFolder,
    projectDir,
  }

  try {
    if (isEmpty(argv.projectName)) {
      logger.warn("Given project name is empty")
      result.status = "emptyName"
      return result
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
        result.status = "invalidNpmName"
        return result
      }
      const packageNameExists = await npmNameExists(argv.projectName)
      if (packageNameExists) {
        logger.error(`Already exists: https://yarnpkg.com/package/${argv.projectName}`)
        result.status = "alreadyExistsOnNpm"
        return result
      }
    }

    const projectDirExists = await fsp.pathExists(projectDir)
    if (projectDirExists) {
      logger.error(`${projectDir} already exists!`)
      result.status = "dirAlreadyExists"
      return result
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

    await fetchGitRepo(cloneId, projectDir)
    const projectDirExistsNow = await fsp.pathExists(projectDir)
    if (projectDirExistsNow) {
      result.createdDir = true
    } else {
      logger.error(`Could not clone ${cloneId} to ${projectDir} for some reason`)
      result.status = "couldNotClone"
      return result
    }

    logger.info("Transforming file contents")
    await fsp.writeFile(path.join(projectDir, "readme.md"), resolveHandlebars(config.readme))

    const pkgFile = path.join(projectDir, "package.json")
    const pkg = await fsp.readJson(pkgFile)
    pkg.description = resolvedDescription
    pkg.version = argv.initialVersion
    await fsp.writeJson(pkgFile, pkg)

    // @ts-ignore This is callable
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

    const createRepoArguments = [
      "create",
      ...argv.privateRepo ? ["--private"] : [],
      "-d",
      resolvedDescription,
      "-h",
      `https://github.com/${argv.owner}/${argv.projectName}`,
    ]
    if (argv.dry) {
      console.dir(`[Dry] ${argv.hubPath} ${createRepoArguments}`)
    } else {
      await execa(argv.hubPath, createRepoArguments, {
        cwd: projectDir,
      })
    }

    const pushArguments = [
      "push",
      "--set-upstream",
      "origin",
      "master",
    ]
    if (argv.dry) {
      console.dir(`[Dry] ${argv.hubPath} ${pushArguments}`)
    } else {
      await execa(argv.hubPath, pushArguments, {
        cwd: projectDir,
      })
    }

    const openCodeArguments = [
      "--new-window",
      projectDir,
    ]
    if (argv.dry) {
      console.dir(`[Dry] ${argv.codePath} ${openCodeArguments}`)
    } else {
      await execa(argv.codePath, openCodeArguments)
    }

    for (const urlTemplate of ensureArray(config.openUrls)) {
      const url = resolveHandlebars(urlTemplate)
      if (argv.dry) {
        console.dir("[Dry] Open URL ", url)
      } else {
        await open(url, {})
      }
    }

    result.status = "ok"
    result.exitCode = 0
    return result
  } catch (error) {
    result.status = "unknownError"
    logger.error(error)
    return result
  }
}