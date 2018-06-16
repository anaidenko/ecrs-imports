import PromiseRouter from 'express-promise-router'
import JaxDataImporter from '../importers/JaxDataImporter'

const routes = PromiseRouter()
routes.route('/import').all(async (req, res) => {
  try {
    let imported = await new JaxDataImporter().import()
    res.send(`import completed for ${imported} items on ${new Date()}`)
  } catch (err) {
    return res.status(500).send(err)
  }
})

export default routes
