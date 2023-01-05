const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

//Ex: 4.15--4.17 added router app.js and updated middleware for jwt
usersRouter.post('/', async (req, res) => {
  const { username, name, password } = req.body

  const existingUser = await User.findOne({ username })
  if (existingUser) {
    return res.status(400).json({
      error: 'username must be unique'
    })
  } else if (username.length < 3) {
    return res.status(400).json({
      error: 'User validation failed: username is shorter than the minimum allowed length (3)'
    })
  } else if (password.length < 3) {
    return res.status(400).json({
      error: 'User validation failed: password is shorter than the minimum allowed length (3)'
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username: username,
    name: name,
    passwordHash,
  })

  const savedUser = await user.save()

  res.status(201).json(savedUser)
})

usersRouter.get('/', async (req, res) => {
  const users = await User
    .find({})
    .populate('blogs', { url: 1, title: 1, author: 1 })
  res.json(users)
})

module.exports = usersRouter
