import PromiseRouter from 'express-promise-router'

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

routes.route('/import/:client').all(async (req, res) => {
  try {
    const clientParam = req.params.client.toLowerCase()
    const clientRequested = All.find(client => client.name.toLowerCase() === clientParam)
    if (!clientRequested) return res.status(404).send('Client not found')
    await importClients([clientRequested])
    res.send(`${clientRequested.name} import completed on ${new Date()}`)
  } catch (err) {
    return res.status(500).send(err)
  }
})

export { routes }
