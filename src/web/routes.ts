import PromiseRouter from 'express-promise-router'
import JaxDataImporter from '../importers/JaxDataImporter'

const routes = PromiseRouter()
routes.route('/import').all(async (req, res) => {
  let imported = await new JaxDataImporter().run()
  res.send(`import completed for ${imported} items on ${new Date()}`)
})

export default routes
