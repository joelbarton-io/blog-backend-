const blogRouter = require('express').Router()
const print = require('../utils/print')
require('express-async-errors')
const Blog = require('../models/blog')
const middleware = require('../utils/middleware')

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.status(200).json(blogs)
})

blogRouter.post('/', middleware.userExtractor, async (request, response) => {
  const { title, author, url, likes, user } = request.body

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

  const loggedInUser = request.user
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

blogRouter.delete(
  '/:id',
  middleware.userExtractor,
  async (request, response) => {
    const loggedInUser = request.user

    const blogToDelete = await Blog.findById(request.params.id)
    if (!blogToDelete) return response.status(404).end()

    const blogCreatorId = loggedInUser._id.toString()
    const loggedInUserId = blogToDelete.user.toString()

    if (blogCreatorId !== loggedInUserId) {
      response.status(401).json({
        error: 'invalid action',
      })
    }

    await Blog.findByIdAndDelete(request.params.id)

    loggedInUser.blogs = loggedInUser.blogs.filter(
      (blogId) => blogId.toString() !== request.params.id
    )
    await loggedInUser.save()

    response.status(204).end()
  }
)

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
