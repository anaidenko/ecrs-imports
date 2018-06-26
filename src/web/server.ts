import * as http from 'http'
import app from './express'
import * as config from '../config'

const server = http.createServer(app)
server.listen(config.Port)

console.log(`Web application started at http://localhost:${config.Port}`)
