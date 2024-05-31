const blogRouter = require('express').Router()
// const print = require('../utils/print')
require('express-async-errors')
const Blog = require('../models/blog')

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.status(200).json(blogs)
})

blogRouter.post('/', async (request, response) => {
  try {
    const blog = new Blog(request.body)
    const result = await blog.save()
    // when testing for failed create with missing body properties, the error is 500 bears a mongo/mongoose error
    // hence the try catch
    response.status(201).json(result)
  } catch (exception) {
    response.status(400).end()
  }
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
