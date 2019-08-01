const express = require('express')
const xss = require('xss')
const logger = require('../../logger')
const entriesService = require('./entries-service')

const entriesRouter = express.Router()
const jsonBodyParser = express.json()

entriesRouter
    .route('/')
    .post(jsonBodyParser, (req, res, next) => {
        // TODO figure out where to get user_id; may want to take it out of req.body
        for (const key of ['notes', 'img', 'song', 'user_id']) {
            if (!req.body[key]) {
                logger.error(`Entry post request missing ${key}`)
                return res
                    .status(400)
                    .json({error: {message: `Must include ${key} in request`}})
            }
        }
    })

module.exports = entriesRouter