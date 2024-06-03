const totalLikes = (blogs) => blogs.reduce((sum, blog) => sum + blog.likes, 0)
const favorite = (blogs) => {
  if (blogs.length === 0) {
    return {}
  } else {
    const fav = blogs.reduce((mostPopular, candidate) => {
      if (mostPopular.likes < candidate.likes) {
        mostPopular = candidate
      }

      return mostPopular
    })

    return {
      author: fav.author,
      title: fav.title,
      likes: fav.likes,
    }
  }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) return {}

  let maxLikesAuthor = { author: '', likes: 0 }

  const reducer = (acc, curr) => {
    if (curr.author in acc) {
      acc[curr.author].likes += curr.likes
    } else {
      acc[curr.author] = {
        author: curr.author,
        likes: curr.likes,
      }
    }

    if (acc[curr.author].likes > maxLikesAuthor.likes) {
      maxLikesAuthor = acc[curr.author]
    }

    return acc
  }

  blogs.reduce(reducer, {})

  return maxLikesAuthor
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return {}

  let maxBlogsAuthor = { author: '', blogs: 0 }

  const reducer = (acc, curr) => {
    if (curr.author in acc) {
      acc[curr.author].blogs += 1
    } else {
      acc[curr.author] = {
        author: curr.author,
        blogs: 1,
      }
    }

    if (acc[curr.author].blogs > maxBlogsAuthor.blogs) {
      maxBlogsAuthor = acc[curr.author]
    }

    return acc
  }

  blogs.reduce(reducer, {})

  return maxBlogsAuthor
}

module.exports = {
  totalLikes,
  favorite,
  mostBlogs,
  mostLikes,
}
