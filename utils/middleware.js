const print = require('./print')
// const morgan = require('morgan')

const requestLogger = (request, response, next) => {
  print.info('Method:', request.method)
  print.info('Path:  ', request.path)
  print.info('Body:  ', request.body)
  print.info('---')
  next()
}

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (
    error.name === 'MongoServerError' &&
    error.message.includes('E11000 duplicate key error')
  ) {
    return response
      .status(400)
      .json({ error: 'expected `username` to be unique' })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'token invalid' })
  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({ error: 'token expired' })
  }

  next(error)
}

const tokenExtractor = (request, response, next) => {
  const auth = request.get('authorization')
  if (auth && auth.startsWith('Bearer ')) {
    request.token = auth.replace('Bearer ', '')
  }

  next()
}

module.exports = {
  requestLogger,
  errorHandler,
  tokenExtractor,
}
