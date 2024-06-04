/* todo: 
- backend routing (creating a user)
- user model
- bcrypt + jsontokenauth
- blogs must be associated with users
*/
const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const blogRouter = require('./controllers/blog')
const userRouter = require('./controllers/user')
const loginRouter = require('./controllers/login')
const middleware = require('./utils/middleware')
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
app.use(middleware.tokenExtractor)
app.use('/api/blogs', blogRouter)
app.use('/api/users', userRouter)
app.use('/api/login', loginRouter)
app.use(middleware.errorHandler)
module.exports = app
