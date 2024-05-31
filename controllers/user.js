const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  if (!username || username.length < 3) {
    return response.status(400).json({ error: 'invalid username, min length of 3' })
  }

  if (await User.find({ username: username })) {
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

  response.status(201).json(savedUser)
})

usersRouter.get('/', async (request, response) => {
  const users = await User.find({})
  response.status(201).json(users)
})

module.exports = usersRouter
