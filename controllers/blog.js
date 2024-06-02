const blogRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const print = require('../utils/print')
require('express-async-errors')
const Blog = require('../models/blog')
const User = require('../models/user')

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  //   print.error({ blogs })
  response.status(200).json(blogs)
})

blogRouter.post('/', async (request, response) => {
  const { title, author, url, likes, user } = request.body
  /* global process */
  const decodedToken = jwt.verify(request.token, process.env.SECRET)

  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  if (!user) {
    return response
      .status(400)
      .json({ error: 'notes must be associated with a user' })
  }

  if (!title || !url) {
    return response
      .status(400)
      .json({ error: 'title and url must be valid strings' })
  }

  const loggedInUser = await User.findById(decodedToken.id)

  const blog = new Blog({
    title,
    author,
    url,
    likes: likes === undefined ? 0 : likes,
    user: loggedInUser._id,
  })

  const savedBlog = await blog.save()

  loggedInUser.blogs = loggedInUser.blogs.concat(savedBlog._id)
  await loggedInUser.save()
  response.status(201).json(savedBlog)
})

blogRouter.delete('/:id', async (req, res) => {
  const blog = await Blog.findById(req.params.id)
  if (!blog) return res.status(404).end()
  await Blog.findByIdAndDelete(req.params.id)
  res.status(204).end()
})

blogRouter.put('/:id', async (request, response) => {
  const body = request.body
  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  }
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {
    new: true,
  })
  response.json(updatedBlog)
})

module.exports = blogRouter
