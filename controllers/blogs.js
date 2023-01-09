
const blogsRouter = require('express').Router()
const logger = require('../utils/logger')
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')


blogsRouter.get('/', async (req, res) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1 })
  res.json(blogs.map(blog => blog.toJSON()))
})

blogsRouter.get('/:id', async (req, res, next) => {
  const blog = await Blog.findById(req.params.id)
  if (blog) {
    res.json(blog.toJSON())
  } else {
    res.status(404).end()
  }
})

blogsRouter.post('/', async (req, res, next) => {
  const body = req.body

  const token = req.token
  const decodedToken = jwt.verify(token, process.env.SECRET)

  const user = await User.findById(decodedToken.id)
  //const user = req.user

  if (!body.likes) {
    body.likes = 0
  }

  if (!body.comments) {
    body.comments = []
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    comments: body.comments,
    user: user._id
  })

  try {
    const savedBlog = await blog.save()
    logger.info(`added ${blog.title} to the blog list`)
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    res.status(201).json(savedBlog.toJSON())

  } catch (exception) {
    next(exception)
  }
})

blogsRouter.delete('/:id', async (req, res, next) => {
  const token = req.token
  const decodedToken = jwt.verify(token, process.env.SECRET)

  const user = await User.findById(decodedToken.id)
  //const user = req.user

  const blogToDelete = await Blog.findById(req.params.id)

  if (blogToDelete.user._id.toString() === user._id.toString()) {
    try {
      await Blog.findByIdAndRemove(req.params.id)
      res.status(204).end()

    } catch (exception) {
      next(exception)
    }
  } else {
    return res.status(401).json({ error: 'Unauthorized' })
  }
})

blogsRouter.put('/:id', async (req, res, next) => {
  const body = req.body

  if (!body.likes) {
    body.likes = 0
  }

  if (!body.comments) {
    body.comments = []
  }

  const token = req.token
  const decodedToken = jwt.verify(token, process.env.SECRET)
  const user = await User.findById(decodedToken.id)

  const blogToUpdate = await Blog.findById(req.params.id)

  if ( blogToUpdate.user._id.toString() === user._id.toString() ) {
    const blog = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      comments: body.comments,
    }

    try {
      const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, blog, { new: true })
      logger.info(`blog ${blog.title} successfully updated`)
      res.json(updatedBlog.toJSON())
    } catch (exception) {
      next(exception)
    }
  } else {
    return res.status(401).json({ error: 'Unauthorized' })
  }
})

module.exports = blogsRouter
