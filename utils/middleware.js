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
  } /* else if (
    error.name === 'MongoServerError' &&
    error.message.includes('E11000 duplicate key error')
  ) {
    return response
      .status(400)
      .json({ error: 'expected `username` to be unique!' })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'invalid token' })
  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({ error: 'token expired' })
  } */

  next(error)
}
// morgan.token('body', (request, response) => JSON.stringify(request.body))
// const morganLogger = morgan((tokens, request, response) => {
//   print.info('request.body', request.body)
//   print.info('reached morgan logger middleware...')
//   return [
//     tokens.method(request, response),
//     tokens.url(request, response),
//     tokens.status(request, response),
//     tokens.res(request, response, 'content-length'),
//     '-',
//     tokens['response-time'](request, response),
//     'ms',
//     tokens.body(request, response),
//   ].join(' ')
// })

// const errorHandler = (error, request, response, next) => {
//   print.info('reached error handler middleware...')
// //   print.error(error.message)
//   next(error)
// }

module.exports = {
  requestLogger,
  errorHandler,
}
