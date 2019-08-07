const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const photoRouter = require('./photos/photo-router')
const spotifyRouter = require('./spotify/spotify-router')
const entriesRouter = require('./entries/entries-router')
const usersRouter = require('./users/users-router')

const app = express()

app.use(morgan((NODE_ENV === 'production') ? 'tiny' : 'common', {
  skip: () => NODE_ENV === 'test',
}))
app.use(cors())
app.use(helmet())

app.use('/api/photos', photoRouter)
app.use('/api/music', spotifyRouter)
app.use('/api/entries', entriesRouter)
app.use('/api/users', usersRouter)

app.get('/', (req, res) => {
  res.send('Howdy')
})

app.use(function errorHandler(error, req, res, next) {
  let response
  if (NODE_ENV === 'production') {
    response = { error: 'server error' }
  } else {
    console.error(error)
    response = { error: error.message, details: error }
  }
  res.status(500).json(response)
})

module.exports = app
