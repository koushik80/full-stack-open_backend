const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')

beforeEach(async () => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('password', 10)
  const user = new User({
    username: 'root',
    name: 'Superuser',
    passwordHash,
    blogs: []
  })

  await user.save()
})

beforeEach(async () => {
  await Blog.deleteMany({})

  const users = await User.find({})
  const user = users[0]
  const id = users[0]._id

  const blogObjects = helper.initialBlogs
    .map(blog => new Blog({
      title: blog.title,
      author: blog.author,
      url: blog.url,
      user: id.toString(),
      likes: blog.likes ? blog.likes : 0
    }))
  const promiseArray = blogObjects.map(blog => {
    blog.save()
    user.blogs = user.blogs.concat(blog._id)
  })
  await Promise.all(promiseArray)
  await user.save()
})

describe('Testing HTTP GET request', () => {
  //ex 4.8
  test('blogs are returned as json', async () => {
    console.log('entered test')
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  }, 100000)

  test('all blogs are returned', async () => {
    const response = await api
      .get('/api/blogs')

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('all blogs are containing with creator info', async () => {
    const response = await api
      .get('/api/blogs')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  //Practice tests
  test('a specific blog is within the returned blogs', async () => {
    const response = await api
      .get('/api/blogs')

    const contents = response.body.map(response => response.title)

    expect(contents).toContain(
      'Go To Statement Considered Harmful'
    )
  }, 100000)
})

//ex 4.9
describe('Verify the unique identifier property of the blog posts is named id', () => {
  test('Testing the ID field is defined as id instead of _id', async () => {
    const blogs = await Blog.find({})
    expect(blogs[0]._id).toBeDefined()
  })
})

// ex 4.10-4.12
describe('addition of new blog with Post request', () => {
  //a test that adds a new blog and verifies that the amount of blogs returned by the API increases, and that the newly added blog is in the list.
  // ex 4.10
  let headers

  beforeEach(async () => {
    const user = {
      username: 'root',
      password: 'passtest',
    }

    const loginUser = await api
      .post('/api/login')
      .send(user)

    headers = {
      'Authorization': `bearer ${loginUser.body.token}`
    }
  })

  test('succeeds with valid data', async () => {
    const newBlog = {
      title: 'First class tests',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
      likes: 10,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .set(headers)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const contents = blogsAtEnd.map(response => response.title)
    expect(contents).toContain(
      'First class tests'
    )
  })

  // ex 4.11
  test('Testing to verify if the likes property is missing from the request', async () => {
    const newBlog = {
      title: 'unknown',
      author: 'unknown',
      url: 'unlike.com',
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .set(headers)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const contents = blogsAtEnd.map(response => response.likes)

    expect(
      contents.reduce(
        (count, num) => (num === 0 ? count + 1: count), 0
      )
    )
  })
  // ex 4.12
  //test that verifies that a blog without title and url will not be saved into the database.
  test('blog without title and url is not added', async () => {
    const newBlog = {
      author: 'Edsger W. Dijkstra',
      likes: 5
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
      .set(headers)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length)
  })
})

//tests for fetching(Practice tests):
describe('viewing a specific note', () => {
  test('succeeds with valid id', async () => {
    const blogsAtStart = await helper.blogsInDb()

    const blogToView = blogsAtStart[0]

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const processedBlogToView = JSON.parse(JSON.stringify(blogToView))

    expect(resultBlog.body).toEqual(processedBlogToView)
  })

  test('fails with statuscode 404 if note does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()

    console.log(validNonexistingId)

    await api
      .get(`/api/blogs/${validNonexistingId}`)
      .expect(404)
  })
})

//removing an individual blog
describe('deletion of a note', () => {
// ex 4.13
  let headers

  beforeEach(async () => {
    const user = {
      username: 'root',
      password: 'passtest',
    }

    const loginUser = await api
      .post('/api/login')
      .send(user)

    headers = {
      'Authorization': `bearer ${loginUser.body.token}`
    }
  })
  test('a blog can be deleted', async () => {
    const allBlogs = await helper.blogsInDb()

    const blogToDelete = allBlogs.find(blog => blog.title)

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)
      .set(headers)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length - 1
    )

    const contents = blogsAtEnd.map(response => response.title)

    expect(contents).not.toContain(blogToDelete.title)
  })

  test('a blog can be deleted from DB by loggedin user', async () => {
    const allBlogs = await helper.blogsInDb()

    const blogToDelete = allBlogs.find(blog => blog.title)

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)
      .set(headers)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length - 1
    )

    const contents = blogsAtEnd.map(response => response.title)

    expect(contents).not.toContain(blogToDelete.title)
  })
})

//updating blog
describe('Updating the information of an individual blog post', () => {
// ex 4.14
  test('Updating amount of likes in a blog', async () => {

    const newBlog = {
      title:'First class tests',
      author:'Robert C. Martin',
      url:'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
      likes:10
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(200)

    const currentBlogsInDb = await helper.blogsInDb()
    const blogToUpdate = currentBlogsInDb.find(blog => blog.title === newBlog.title)

    const updatedBlog = {
      ...blogToUpdate,
      likes: blogToUpdate.likes + 1
    }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAfterUpdate = await helper.blogsInDb()
    expect(blogsAfterUpdate).toHaveLength(helper.initialBlogs.length + 1)

    const contents = blogsAfterUpdate.find(blog => blog.likes === 11)
    expect(contents.likes).toBe(11)
  })
})


describe ('Testing creator info:', () => {
  test ('creators id', async () => {
    const users = await User.find({})
    const id = users[0]._id

    const blogs = await helper.blogsInDb()
    const contents = blogs.map(response => response.user)
    expect(contents).toContainEqual(id)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
