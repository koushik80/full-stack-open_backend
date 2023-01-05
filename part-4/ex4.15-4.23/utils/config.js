require('dotenv').config()

//ex: 4.15 -4.17
const PORT = process.env.PORT
const MONGODB_URI = process.env.NODE_ENV === 'test'
  ? process.env.TEST_MONGODB_URL_DEV
  : process.env.MONGODB_URL_DEV

module.exports = {
  MONGODB_URI,
  PORT
}
