import which from "which"

import logger from "lib/logger"

/**
 * @param {string} name
 * @return {Promise<undefined|string>}
 */
export default async name => {
  try {
    const executablePath = await which(name)
    return executablePath
  } catch (error) {
    logger.warn(`No executable found for ${name}`)
  }
}