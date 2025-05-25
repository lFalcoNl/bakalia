const serverless = require('serverless-http')
const app = require('./server.js')   // your Express app assembled in src/app.js
module.exports = app
module.exports.handler = serverless(app)
