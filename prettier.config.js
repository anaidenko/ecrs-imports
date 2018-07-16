import { readFileSync } from 'fs'

module.exports = JSON.parse(readFileSync('./prettierrc'))
