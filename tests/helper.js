const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    title: 'Test Blog',
    author: 'Test Author',
    url: 'http://www.test.com',
    likes: 1,
  },
  {
    title: 'Test Blog 2',
    author: 'Test Author 2',
    url: 'http://www.test2.com',
    likes: 0,
  },
  {
    title: 'Test Blog 3',
    author: 'Test Author 3',
    url: 'http://www.test3.com',
    likes: 3,
  },
  {
    title: 'Test Blog 4',
    author: 'Test Author 4',
    url: 'http://www.test4.com',
    likes: 100,
  },
]

const validTestBlog = {
  title: 'Test Blog',
  author: 'Test Author',
  url: 'http://test.com',
  likes: 0,
}

const getFakeID = async () => {
  const temporary = new Blog({
    title: 'TEMPORARY',
    author: 'TEMPORARY',
    url: 'TEMPORARY',
    likes: 321,
  })
  await temporary.save()
  await temporary.deleteOne()
  return temporary._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map((blog) => blog.toJSON())
}

const rootUser = {
  username: 'root',
  name: 'rootie',
  password: '123abc',
}

const validUser = {
  username: 'leroy',
  name: 'leroy jenkins',
  password: "let's do this",
}

const invalidUserNameUser = {
  username: 'i',
  name: 'invalid username length',
  password: 'xd',
}

const dupUser = {
  username: 'root',
  name: 'IMPOSTER',
  password: 'abc123',
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map((user) => user.toJSON())
}

module.exports = {
  validTestBlog,
  initialBlogs,
  getFakeID,
  blogsInDb,
  usersInDb,
  rootUser,
  validUser,
  invalidUserNameUser,
  dupUser,
}
