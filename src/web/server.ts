import * as http from 'http'

import * as config from '../config'

import { app } from './express'

const server = http.createServer(app)
server.listen(config.Port)

console.log(`Web application started at http://localhost:${config.Port}`)
