require('dotenv').config()
const mongoose = require('mongoose')
const Blog = require('./models/blog')
const print = require('./utils/print')
/* global process */
const uri = process.env.TEST_MONGO_URI

mongoose.set('strictQuery', false)

mongoose
  .connect(uri)
  .then(() => {
    print.info('Successfully connected to DB!')
  })
  .catch((exception) => {
    print.error(
      `something went wrong when connecting to mongodb, REASON: ${exception}`
    )
  })

const res = (async () => {
  return await Blog.find({})
})()

res.then((result) => {
  console.log(result)
})
// const blogs = [
//   {
//     title: 'Test Blog',
//     author: 'Test Author',
//     url: 'http://www.test.com',
//     likes: 1,
//   },
//   {
//     title: 'Test Blog 2',
//     author: 'Test Author 2',
//     url: 'http://www.test2.com',
//     likes: 0,
//   },
//   {
//     title: 'Test Blog 3',
//     author: 'Test Author 3',
//     url: 'http://www.test3.com',
//     likes: 3,
//   },
//   {
//     title: 'Test Blog 4',
//     author: 'Test Author 4',
//     url: 'http://www.test4.com',
//     likes: 100,
//   },
// ]

// Blog.insertMany(blogs).then(() => {
//   print.info(`added ${blogs.length} blogs to db`)
//   mongoose.connection.close()
// })
