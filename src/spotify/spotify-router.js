const express = require('express')
const xss = require('xss')
const logger = require('../../logger')
const SpotifyService = require('./spotify-service')

const spotifyRouter = express.Router()
const jsonBodyParser = express.json()

spotifyRouter
    .route('/')
    .get((req, res) => {
        res.send('yolo')
    })

spotifyRouter
    .route('/search/:keyword')
    .get((req, res, next) => {
        const { keyword } = req.params
        SpotifyService.spotifySearch(keyword)
            .then(searchResults => res.json(searchResults))
    })

spotifyRouter
    .route('/vibes/')
    .post(jsonBodyParser, (req, res, next) => {
        const { type } = req.headers
        console.log('body', req.body)
        if (!type || (type !== 'artist' && type !== 'track')) {
            logger.error(`vibe post missing type header`)
            return res
                .status(400)
                .json({error: {message: `vibe post missing type header`}})
        }
        if (type === 'artist') {
            for (const key of ['name', 'id', 'img', 'user_id']) {
                if (!req.body[key]) {
                    logger.error(`artist post missing ${key}`)
                    res.status(400)
                        .json({error: {message: `Artist vibe body missing ${key}`}})
                }
            }
            SpotifyService.addArtist(req.app.get('db'), req.body)
                .then(artist => {
                    logger.info(`user ${artist.user_id}'s preferences updated with artist ${artist.id}`)
                    res.status(201).json(artist)
                })
        }
        if (type === 'track') {
            for (const key of ['name', 'id', 'img', 'artist', 'album', 'user_id']) {
                if (!req.body[key]) {
                    logger.error(`track post missing ${key}`)
                    res
                        .status(400)
                        .json({error: {message: `Track vibe body missing ${key}`}})
                }
            }
        }
        SpotifyService.addTrack(req.app.get('db'), req.body)
            .then(track => {
                logger.info(`user ${track.user_id}'s preferences updated with track ${track.id}`)
                res
                    .status(201)
                    .json(track)
            })
    })

module.exports = spotifyRouter