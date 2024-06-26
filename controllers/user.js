const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const print = require('../utils/print')

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  if (!username || username.length < 3) {
    return response.status(400).json({ error: 'invalid username' })
  }

  const list = await User.find({ username })

  if (list && list.length) {
    return response.status(400).json({ error: 'username must be unique' })
  }

  if (!password || password.length < 3) {
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

  response.status(201).json(savedUser)
})

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', {
    url: 1,
    name: 1,
    id: 1,
  })

  response.status(201).json(users)
})

module.exports = usersRouter
