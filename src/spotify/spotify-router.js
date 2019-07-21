const express = require('express')
const xss = require('xss')
const logger = require('../../logger')
const SpotifyService = require('./spotify-service')

const spotifyRouter = express.Router()

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

module.exports = spotifyRouter