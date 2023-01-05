const dummy = (blogs) => 1

const totalLikes = (blogs) => blogs.reduce((totalLikes, savedBlog) => totalLikes + savedBlog.likes, 0)

const favoriteBlog  = (blogs) => {
  const topFavorite = blogs.reduce((favorite, savedBlog) => favorite = favorite.likes > savedBlog.likes ? favorite : savedBlog, 0)

  return {
    'title': topFavorite.title,
    'author': topFavorite.author,
    'likes': topFavorite.likes
  }
}

const mostBlogs = (blogs) => {
  const authors = {}
  const topAuthor = {
    author: '',
    blogs: 0
  }

  blogs.forEach((blog) => {
    authors[blog.author] = authors[blog.author]
      ? authors[blog.author] + 1
      : 1
  })

  for (const [author, blogs] of Object.entries(authors)) {
    if (blogs > topAuthor.blogs) {
      topAuthor.author = author
      topAuthor.blogs = blogs
    }
  }

  return topAuthor
}


const mostLikes = (blogs) => {
  const authors = {}
  const topAuthor = {
    author: '',
    likes: 0
  }

  blogs.forEach((blog) => {
    authors[blog.author] = authors[blog.author]
      ? authors[blog.author] + blog.likes
      : blog.likes
  })

  for (const [author, likes] of Object.entries(authors)) {
    if (likes > topAuthor.likes) {
      topAuthor.author = author
      topAuthor.likes = likes
    }
  }

  return topAuthor
}


module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}
