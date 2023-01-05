const Blog = require('../models/blog')
const User = require('../models/user')

// ex 4.15-4.17
const initialBlogs = [
  {
    id: '63b1f851365bd117e2c1e5ea',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Consider…',
    likes: 5
  },
  {
    id: '63b1f851365bd117e2c1e5ec',
    title: 'React patterns',
    author: 'Edsger W. Dijkstra',
    url: 'https://reactpatterns.com/',
    likes: 7
  }
]

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const nonExistingId = async () => {
  const blog = new Blog({
    title: 'unknown title',
    author: 'unknown author',
    url: 'unknown.com',
    likes:0
  })

  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  initialBlogs,
  blogsInDb,
  nonExistingId,
  usersInDb,
}
