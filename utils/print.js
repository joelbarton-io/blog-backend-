const info = (...messages) => {
  console.log(...messages)
}

const error = (...messages) => {
  console.error(...messages)
}

module.exports = { info, error }
