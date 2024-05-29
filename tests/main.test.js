/* 
install: 
- supertest
- express-async-errors
- crossenv

add to package.json:
- test script
- & crossenv

add TEST_MONGODB_URI to .env file

in main.test.js:
    - import blog model, test, describe, after, beforeEach assert, helper
    - wrap app instance in supertest
    - setup mongoose disconnect
    - write tests
        - beforeEach
        - routes
        - general
*/
const Blog = require('../models/blog')
const { test, describe, after, beforeEach } = require('node:test')
const print = require('../utils/print')
const assert = require('node:assert')
const supertest = require('supertest')
const helper = require('./helper')
const mongoose = require('mongoose')
const app = require('../app')
const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  const blogObjects = helper.initialBlogs.map((o) => new Blog(o))
  await Promise.all(blogObjects.map((blog) => blog.save()))
  //   Blog.insertMany(blogs).then(() => {
  //     print.info(`added ${blogs.length} blogs to db`)
  //     mongoose.connection.close()
  //   })
})

describe('basic tests', () => {
  test('fetch list of blogs', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.equal(response.status, 200)
    assert.ok(response.body.length, helper.initialBlogs.length)
  })

  test('objects have an "id" property', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert(response.body.every((blog) => 'id' in blog && !('_id' in blog)))
  })

  test('create a blog post', async () => {
    const postReq = await api
      .post('/api/blogs')
      .send({
        title: 'Test Blog 10000000',
        author: 'LEROY JENKINS',
        url: 'http://www.testLEROY.com',
        likes: 900000,
      })
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const getReq = await api.get('/api/blogs')
    assert(getReq.body.some(({ id }) => id === postReq.body.id))
    assert.strictEqual(getReq.body.length, 1 + helper.initialBlogs.length)
  })

  test("'likes' property is present on the post request's data", async () => {
    const postReq = await api
      .post('/api/blogs')
      .send({
        title: 'Test Blog 10000000',
        author: 'LEROY JENKINS',
        url: 'http://www.testLEROY.com',
      })
      .expect(201)
      .expect('Content-Type', /application\/json/)
    // print.error(postReq.body)
    assert.strictEqual(postReq.body.likes, 0)
  })

  test("400 Bad Request if either the 'title' or 'url' property is missing", async () => {
    const postReq = await api.post('/api/blogs').send({}).expect(400)
    assert.strictEqual(postReq.status, 400)
  })

  test('404 Not Found for failed delete operation with an invalid blog id', async () => {
    const phonyID = await helper.getFakeID()
    print.error(phonyID)
    await api.delete(`/api/blogs/${phonyID}`).expect(404)
  })

  test('succeeds with a status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204)
    const blogsAtEnd = await helper.blogsInDb()

    assert(blogsAtEnd.length + 1 === blogsAtStart.length)
  })

  test('successfully update like count of a blog', async () => {
    const currentBlogs = await helper.blogsInDb()
    const blogToUpdate = currentBlogs[0]
    blogToUpdate.likes++

    const updatedBlog = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(blogToUpdate)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(updatedBlog.body.likes, blogToUpdate.likes)
  })
})

after(async () => {
  await mongoose.connection.close()
  print.info('disconnecting from DB...')
})
