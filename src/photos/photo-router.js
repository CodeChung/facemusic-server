const express = require('express')
const xss = require('xss')
const logger = require('../../logger')
const parseDataUri = require('parse-data-uri')
const photoService = require('./photo-service')


const photoRouter = express.Router()
const jsonBodyParser = express.json({limit: '10mb', extended: true})

photoRouter
    .route('/')
    .post(jsonBodyParser, (req, res, next) => {
        const { img } = req.body
        //check for image
        if (!img) {
            logger.error('Img post request with no uri')
            res.status(400).json({error: { message: 'No data sent with image post request'}})
        }
        //verify image filetype
        if (!parseDataUri(img).mimeType.startsWith('image')) {
            logger.error('Non image file submitted to post request')
            res.status(400).json({error: { message: 'Must send image filetype'}})
        }
        photoService.uploadPhoto(img)
    })

module.exports = photoRouter