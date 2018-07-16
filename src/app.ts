import { importClients } from './api/clientImporter'
import * as clients from './clients'
import * as config from './config'
import { containerDispose } from './core/container'

async function run() {
  try {
    const targetClient = config.DebugClient ? clients[config.DebugClient] : null
    await importClients(targetClient ? [targetClient] : clients.All)
  } finally {
    // release resources to allow app exit
    await containerDispose()
  }
}

run().catch(() => 0)
