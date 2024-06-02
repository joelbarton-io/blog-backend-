require('dotenv').config()
const mongoose = require('mongoose')
const Blog = require('./models/blog')
const User = require('./models/user')
const print = require('./utils/print')

async function manageDatabase() {
  /* global process */
  const uri = process.env.MONGO_URI

  mongoose.set('strictQuery', false)

  try {
    await mongoose.connect(uri)
    print.info('Successfully connected to ', uri)
    print.info('clearing root user from dev db')
    const userDeleteResult = await User.deleteOne({ username: 'root' })
    if (!userDeleteResult.acknowledged) {
      throw new Error({ message: 'failed to delete root' })
    }
    print.info(`deleted: ${userDeleteResult.deletedCount}`)
    print.info('clearing all Blogs from dev db')
    const blogDeleteResult = await Blog.deleteMany({})
    if (!blogDeleteResult.acknowledged) {
      throw new Error({ message: 'failed to delete blogs' })
    }
    print.info(`deleted: ${blogDeleteResult.deletedCount}`)

    print.info('creating a root user...')
    const root = new User({
      username: 'root',
      name: 'rootie',
      password: '123abc',
    })

    print.info('saving root user to db...')
    const savedRootUser = await root.save()

    const rawBlogs = [
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
    const updatedBlogs = rawBlogs.map((rawBlog) => {
      return new Blog({ ...rawBlog, user: savedRootUser._id })
    })

    const blogs = await Promise.all(updatedBlogs.map((blog) => blog.save()))

    savedRootUser.blogs = blogs.map((blog) => blog._id)
    await savedRootUser.save()
  } catch (exception) {
    print.error(exception)
    print.info('caught error here')
  } finally {
    print.info('disconnecting from DB...')
    mongoose.connection.close()
  }
}

manageDatabase()
