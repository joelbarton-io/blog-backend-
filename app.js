const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
const blogRouter = require('./controllers/blogRouter')
// const middleware = require('./utils/middleware')
const print = require('./utils/print')
const mongoose = require('mongoose')
app.use(express.json())

mongoose.set('strictQuery', false)

mongoose
  .connect(config.MONGO_URI)
  .then(() => {
    print.info('connected to', config.MONGO_URI, '...')
  })
  .catch((error) => {
    print.error('error connecting to MongoDB:', error.message)
  })

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use('/api/blogs', blogRouter)

module.exports = app
