import * as express from 'express'
import * as morgan from 'morgan'
import * as path from 'path'

import { routes } from './routes'

const app = express()

app.use(morgan('dev')) // enable logger (morgan)
app.use(express.static(path.join(__dirname, '../../public')))
app.use(routes)

export { app }
