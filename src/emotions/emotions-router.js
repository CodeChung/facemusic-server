const express = require('express')
const xss = require('xss')
const logger = require('logger')
const emotionsService = require('./emotions-service')

const emotionsRouter = express.Router()
const jsonBodyParser = express.json()

emotionsRouter
    .route('/')
    .post(jsonBodyParser, (req, res, next) => {
        // TODO figure out where to get user_id; may want to take it out of req.body
        const emotions = ['anger', 'contempt', 'disgust', 'fear', 'happiness', 'neutral', 'sadness', 'surprise']
        for (const key of emotions) {
            if (!req.body[key]) {
                logger.error(`Emotions post request missing ${key}`)
                return res
                    .status(400)
                    .json({error: {message: `Must include ${key} in request`}})
            }
        }
        emotionsService.saveEmotions(req.app.get('db'), req.body)
            .then(res => console.log(res))
    })