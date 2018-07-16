import PromiseRouter from 'express-promise-router'
import * as slug from 'slug'

import { importClients } from '../api/clientImporter'
import { All } from '../clients'

const routes = PromiseRouter()

routes.route('/import').all(async (req, res) => {
  try {
    await importClients(All)
    res.send(`import completed on ${new Date()}`)
  } catch (err) {
    return res.status(500).send(err)
  }
})

routes.route('/import/:clientSlug').all(async (req, res) => {
  try {
    const clientSlug = req.params.clientSlug.toLowerCase()
    const clientRequested = All.find(client => slug(client.name) === clientSlug)
    if (!clientRequested) return res.status(404).send('Client not found')
    await importClients([clientRequested])
    res.send(`${clientRequested.name} import completed on ${new Date()}`)
  } catch (err) {
    return res.status(500).send(err)
  }
})

export { routes }
