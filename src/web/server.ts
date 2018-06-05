import http = require('http')
import app from './express'

const server = http.createServer(app)
const port = Number(process.env['PORT']) || 3000
server.listen(port)
console.log(`Web application started on port ${port}`)
