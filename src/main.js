import fsp from "@absolunet/fsp"
import fs from "fs/promises"
import readableMs from "readable-ms"

import createProject from "lib/createProject"
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
 * @prop {boolean} dry
 */

/**
 * @param {import("yargs").Arguments<Argv>} argv
 * @return {Promise<void>}
 */
export default async argv => {
  const startTime = Date.now()
  const result = await createProject(argv)
  const endTime = Date.now()
  logger.info(`Result: ${result.status}`)
  logger.info(`Timing: ${readableMs(endTime - startTime)}`)

  if (argv.dry && result.status !== "dirAlreadyExists") {
    await fs.rmdir(result.projectDir, {
      recursive: true,
    })

    const projectDirStillExists = await fsp.pathExists(result.projectDir)
    if (projectDirStillExists) {
      logger.warn(`Path ${result.projectDir} still exists, you have to manually remove it`)
    } else {
      logger.info(`Removed ${result.projectDir} again`)
    }
  }

  if (result.exitCode !== 0) {
    process.exit(result.exitCode)
  }
}