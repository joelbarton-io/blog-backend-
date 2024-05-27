const app = require('./app')
const config = require('./utils/config')
const print = require('./utils/print')

app.listen(config.PORT, () => {
  print.info(`Server running on port ${config.PORT}`)
})
