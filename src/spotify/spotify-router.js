const express = require('express')
const xss = require('xss')
const logger = require('../../logger')
const SpotifyService = require('./spotify-service')
const { requireAuth } = require('../middleware/auth')

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
    .all(requireAuth)
    .get((req, res, next) => {
        SpotifyService.getSeeds(req.app.get('db'), req.user.id)
            .then(seeds => res.json(seeds))
    })
    .post(jsonBodyParser, (req, res, next) => {
        const { type } = req.headers
        const postBody = req.body
        postBody.user_id = req.user.id

        if (!type || (type !== 'artist' && type !== 'track')) {
            logger.error(`vibe post missing type header`)
            return res
                .status(400)
                .json({error: {message: `vibe post missing type header`}})
        }
        if (type === 'artist') {
            const tableType = 'artists'
            for (const key of ['name', 'id', 'img', 'user_id']) {
                if (!req.body[key]) {
                    logger.error(`artist post missing ${key}`)
                    return res.status(400)
                        .json({error: {message: `Artist vibe body missing ${key}`}})
                }
            }
            SpotifyService.addSeed(req.app.get('db'), tableType, postBody)
                .then(artist => {
                    logger.info(`user ${artist.user_id}'s preferences updated with artist ${artist.id}`)
                    res.status(201).json(artist)
                })
        }
        if (type === 'track') {
            const tableType = 'tracks'
            for (const key of ['name', 'id', 'img', 'artist', 'album', 'user_id']) {
                if (!req.body[key]) {
                    logger.error(`track post missing ${key}`)
                    return res
                        .status(400)
                        .json({error: {message: `Track vibe body missing ${key}`}})
                }
            }
            SpotifyService.addSeed(req.app.get('db'), tableType,postBody)
                .then(track => {
                    logger.info(`user ${track.user_id}'s preferences updated with track ${track.id}`)
                    res
                        .status(201)
                        .json(track)
                })
        }
    })
    .delete(jsonBodyParser, (req, res, next) => {
        const { type } = req.headers
        const { id } = req.body

        if (!type || (type !== 'artist' && type !== 'track')) {
            logger.error(`vibe post missing type header`)
            return res
                .status(400)
                .json({error: {message: `vibe post missing type header`}})
        }
        if (type === 'artist') {
            const tableType = 'artists'
            SpotifyService.deleteSeed(req.app.get('db'), tableType, id, req.user.id)
                .then(seed => {
                    logger.info(`user ${req.user.id} deleted artist ${id}`)
                    res.status(204)
                })
        }
        if (type === 'track') {
            const tableType = 'tracks'
            SpotifyService.deleteSeed(req.app.get('db'), tableType, id, req.user.id)
                .then(seed => {
                    logger.info(`user ${req.user.id} deleted track ${id}`)
                    res.status(204)
                })
        }
    })

spotifyRouter
    .route('/demo')
    .post(jsonBodyParser, (req, res, next) => {
        const emotions = req.body
        if (Object.keys(emotions).length === 0) {
            logger.error(`recommendations post must include emotional data`)
            return res
                .status(400)
                .json({error: {message: 'Recommendations post missing emotional data'}})
        }
    
        SpotifyService.getRecommendations(req.app.get('db'), 1, emotions)
            .then(tracks => {
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

spotifyRouter
    .route('/recommendations')
    .all(requireAuth)
    .post(jsonBodyParser, (req, res, next) => {
        const emotions = req.body
        const userId = req.user.id
        if (Object.keys(emotions).length === 0) {
            logger.error(`recommendations post must include emotional data`)
            return res
                .status(400)
                .json({error: {message: 'Recommendations post missing emotional data'}})
        }
    
        SpotifyService.getRecommendations(req.app.get('db'), userId, emotions)
            .then(tracks => {
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