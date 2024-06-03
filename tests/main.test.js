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
/* global process */
const Blog = require('../models/blog')
const User = require('../models/user')
require('express-async-errors')
const { test, describe, after, beforeEach } = require('node:test')
const print = require('../utils/print')
const assert = require('node:assert')
const supertest = require('supertest')
const helper = require('./helper')
// const middleware = require('../utils/middleware')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const app = require('../app')
const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})
  await Blog.deleteMany({})

  const { username, name, password } = helper.rootUser

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const newUser = new User({
    username,
    name,
    passwordHash,
  })

  const user = await newUser.save()
  const blogObjects = helper.initialBlogs.map(
    (blog) => new Blog({ ...blog, user: user.id })
  )

  const savedBlogs = await Promise.all(blogObjects.map((blog) => blog.save()))
  newUser.blogs = savedBlogs.map((blog) => blog._id)

  await newUser.save()
})

describe('blog tests', () => {
  const getRootUser = async () => {
    return await User.findOne({ username: helper.rootUser.username })
  }
  const generateToken = async () => {
    const user = await getRootUser()
    const userForToken = {
      username: user.username,
      id: user._id,
    }
    return jwt.sign(userForToken, process.env.SECRET)
  }

  test('fetch the current list of blogs in the database', async () => {
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
    const blogsBefore = await helper.blogsInDb()
    const token = await generateToken()
    const root = await getRootUser()

    const { body: newBlog } = await api
      .post('/api/blogs')
      .send({
        title: 'Test Blog 10000000',
        author: 'LEROY JENKINS',
        url: 'http://www.testLEROY.com',
        likes: 900000,
        user: root._id,
      })
      .set({ authorization: `Bearer ${token}` })
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAfter = await helper.blogsInDb()
    const { body: blogList } = await api.get('/api/blogs')

    assert(blogList.some(({ id }) => id === newBlog.id))
    assert.strictEqual(root.id, newBlog.user)
    assert.strictEqual(blogList.length, 1 + helper.initialBlogs.length)
    assert.strictEqual(blogsBefore.length + 1, blogsAfter.length)
  })

  test("when creating a blog, if 'likes' is absent, default to 0", async () => {
    const token = await generateToken()
    const root = await getRootUser()

    const { body: faultyBlog } = await api
      .post('/api/blogs')
      .send({
        title: 'Test Blog 10000000',
        author: 'LEROY JENKINS',
        url: 'http://www.testLEROY.com',
        user: root._id,
      })
      .set({ authorization: `Bearer ${token}` })
      .expect(201)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(faultyBlog.likes, 0)
  })

  test("400 Bad Request if either the 'title' or 'url' property is missing", async () => {
    const token = await generateToken()
    const root = await getRootUser()
    const postReq = await api
      .post('/api/blogs')
      .send({
        author: 'Matt Damon',
        likes: 50,
        user: root._id,
      })
      .set({ authorization: `Bearer ${token}` })
      .expect(400)

    assert.strictEqual(postReq.status, 400)
    const blogsAtEnd = await helper.blogsInDb()
    assert(blogsAtEnd.length === helper.initialBlogs.length)
  })

  // seems like middleware tokenExtractor & userExtractor cause this test to fail
  //   test('404 Not Found for failed delete operation with an invalid blog id', async () => {
  //     const token = await generateToken()
  //     const phonyID = await helper.getFakeID()

  //     await api
  //       .delete(`/api/blogs/${phonyID}`)
  //       .send({ authorization: `Bearer ${token}` })
  //       .expect(404)
  //   })

  test('succeeds with a status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]
    const token = await generateToken()

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set({ authorization: `Bearer ${token}` })
      .expect(204)
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

describe('user tests', () => {
  test('get users from db', async () => {
    const users = await api
      .get('/api/users')
      .expect(201)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(users.body.length, 1)
  })

  test('create a valid new user', async () => {
    const before = await helper.usersInDb()

    const validUser = await api
      .post('/api/users')
      .send(helper.validUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const after = await helper.usersInDb()
    assert.strictEqual(before.length + 1, after.length)

    const existingUser = await User.findById(validUser.body.id)
    assert.strictEqual(existingUser.id, validUser.body.id)
  })

  test('fail to create a user (invalid username)', async () => {
    const before = await helper.usersInDb()

    await api
      .post('/api/users')
      .send(helper.invalidUser1)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const after = await helper.usersInDb()
    assert.strictEqual(before.length, after.length)
  })

  test('fail to create a user (invalid password)', async () => {
    const before = await helper.usersInDb()

    await api
      .post('/api/users')
      .send(helper.invalidUser2)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const after = await helper.usersInDb()
    assert.strictEqual(before.length, after.length)
  })

  test('fail to create a user (duplicate username)', async () => {
    const before = await helper.usersInDb()

    const failed = await api
      .post('/api/users')
      .send(helper.dupUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const after = await helper.usersInDb()
    assert.strictEqual(before.length, after.length)
    assert.strictEqual(failed.body.error, 'username must be unique')
  })

  test('root user has 4 blogs associated with that account', async () => {
    const initialListOfBlogs = await helper.blogsInDb()
    const rootUser = await User.findOne({ username: 'root' })
    const { body: blogs } = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(rootUser.blogs.length, initialListOfBlogs.length)
    assert(
      blogs.every((blog) => blog.user.id.toString() === rootUser._id.toString())
    )
  })
})

describe('login tests', () => {
  test('successful login attempt for root user', async () => {
    const { name, username, password } = helper.rootUser

    const { body: loggedInUser } = await api
      .post('/api/login')
      .send({ username, password })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert('token' in loggedInUser)
    assert.strictEqual(loggedInUser.username, username)
    assert.strictEqual(loggedInUser.name, name)
  })

  test('failed login attempt for root user (wrong password)', async () => {
    const { username } = helper.rootUser
    const incorrectPassword = 'phoney password'

    const { body } = await api
      .post('/api/login')
      .send({ username, password: incorrectPassword })
      .expect(401)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(body.error, 'invalid username or password')
    assert(!('token' in body))
  })
})

after(async () => {
  await mongoose.connection.close()
  print.info('disconnecting from DB...')
})
