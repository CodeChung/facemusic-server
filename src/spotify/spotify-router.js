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
    .get((req, res, next) => {
        //TODO REFORMAT 1 WITH SPECIFIC USER IDs
        SpotifyService.getSeeds(req.app.get('db'), 1)
            .then(seeds => res.json(seeds))
    })
    .post(jsonBodyParser, (req, res, next) => {
        const { type } = req.headers
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

spotifyRouter
    .route('/recommendations')
    .post(jsonBodyParser, (req, res, next) => {
        const emotions = req.body
        if (Object.keys(emotions).length === 0) {
            logger.error(`recommendations post must include emotional data`)
            return res
                .status(400)
                .json({error: {message: 'Recommendations post missing emotional data'}})
        }
        //TODO implement user_id && replace with 1
        SpotifyService.getRecommendations(req.app.get('db'), 1, emotions)
            .then(tracks => {
                console.log(tracks)
                if (!tracks.length) {
                    return res
                        .status(400)
                        .json({error: {message: 'Tracks not found, please try again'}})
                }
                res
                    .status(200)
                    .json(tracks)
            })
    })

module.exports = spotifyRouter