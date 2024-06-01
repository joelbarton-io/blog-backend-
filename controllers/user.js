const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  //   console.error({ username, name, password })
  //   response.status(500).json({ error: '💩💩💩' })

  if (!username || username.length < 3) {
    return response.status(400).json({ error: 'invalid username' })
  }

  const what = await User.find({ username })

  if (what && what.length) {
    return response.status(400).json({ error: 'username must be unique' })
  }

  if (!password || username.length < 3) {
    return response.status(400).json({ error: 'invalid password' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const newUser = new User({
    username,
    name,
    passwordHash,
  })

  const savedUser = await newUser.save()
  //   console.error(savedUser)
  response.status(201).json(savedUser)
})

usersRouter.get('/', async (request, response) => {
  const users = await User.find({})
  response.status(201).json(users)
})

module.exports = usersRouter
