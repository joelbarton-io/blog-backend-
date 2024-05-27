const print = require('./print')
// const morgan = require('morgan')

const requestLogger = (request, response, next) => {
  print.info('Method:', request.method)
  print.info('Path:  ', request.path)
  print.info('Body:  ', request.body)
  print.info('---')
  next()
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
  //   errorHandler,
}
