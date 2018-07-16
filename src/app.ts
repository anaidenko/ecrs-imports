import { importClients } from './api/clientImporter'
import { All } from './clients'
import { disposeContainer } from './config/ioc'

async function run() {
  await importClients(All)
  await disposeContainer() // release resources before app exit
}

run().catch(() => 0)
