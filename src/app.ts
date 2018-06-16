import JaxDataImporter from './importers/JaxDataImporter'

async function jax () {
  await new JaxDataImporter().import()
}

jax().catch(() => 0)
