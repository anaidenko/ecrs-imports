import * as express from 'express'
import morgan = require('morgan')
import * as path from 'path'
import routes from './routes'

const app = express()

app.set('views', path.join(__dirname, '../../views'))

app.use(morgan('dev')) // enable logger (morgan)
app.use(express.static(path.join(__dirname, '../../views')))
app.use(routes)

export default app
