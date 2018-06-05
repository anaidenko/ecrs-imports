import logger from './utils/logger'
import JaxDataImporter from './importers/JaxDataImporter'

async function jax () {
  await new JaxDataImporter().run()
}

jax().catch(logger.error)
