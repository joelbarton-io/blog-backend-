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
  const { title, author, url, likes } = request.body
  const loggedInUser = request.user

  if (!loggedInUser) {
    return response
      .status(400)
      .json({ error: 'notes must be associated with a user' })
  }

  if (!title || !url) {
    return response
      .status(400)
      .json({ error: 'title and url must be valid strings' })
  }

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

  response.status(201).json({
    id: savedBlog._id,
    title: savedBlog.title,
    author: savedBlog.author,
    likes: savedBlog.likes,
    url: savedBlog.url,
    user: {
      id: loggedInUser._id,
      name: loggedInUser.name,
      username: loggedInUser.username,
    },
  })
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

blogRouter.put('/:id', middleware.userExtractor, async (request, response) => {
  const loggedInUser = request.user
  const blog = request.body

  if (!loggedInUser) {
    return response.status(401).send({ error: 'invalid user action' })
  }

  if (
    !('likes' in blog) ||
    !blog.user ||
    !blog.author ||
    !blog.title ||
    !blog.url
  ) {
    return response
      .status(400)
      .send({ error: 'request was missing a required data field' })
  }

  blog.likes++
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {
    new: true,
  })

  response.status(201).json({
    likes: updatedBlog.likes,
    author: updatedBlog.author,
    title: updatedBlog.title,
    url: updatedBlog.url,
    user: blog.user,
  })
})

module.exports = blogRouter
