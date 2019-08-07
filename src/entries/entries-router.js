const express = require('express')
const xss = require('xss')
const logger = require('../../logger')
const entriesService = require('./entries-service')
const { requireAuth } = require('../middleware/auth')

const entriesRouter = express.Router()
const jsonBodyParser = express.json()

entriesRouter
    .route('/new')
    .all(requireAuth)
    .post(jsonBodyParser, (req, res, next) => {
        const userId = req.user.id
        const entry = req.body

        for (const key of ['img', 'song', 'emotions']) {
            if (!req.body[key]) {
                logger.error(`Entry post request missing ${key}`)
                return res
                    .status(400)
                    .json({error: {message: `Must include ${key} in request`}})
            }
        }

        entriesService.saveEntry(req.app.get('db'), entry, userId)
            .then(entry => {
                if (entry.error) {
                    return res.status(400).json({error: entries.error})
                }
                return res.json(entry)
            })
    })

entriesRouter
    .route('/')
    .all(requireAuth)
    .get((req, res, next) => {
        // 
        const userId = req.user.id
        //TODO: consider switching this to search by month  https://stackoverflow.com/questions/51542703/knex-select-rows-that-are-in-certain-date-range
        entriesService.getEntries(req.app.get('db'), userId)
            .then(entries => {
                if (entries.error) {
                    return res.status(400).json({error: entries.error})
                }

                return res.json(entries)
            })
    })
    

module.exports = entriesRouter