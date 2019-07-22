const request = require('request')
const knex = require('knex')

//api token expires 3600, should i request a new one each time a perform a search or save it and only call when time is up?

getAccessToken = () => {
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            'Authorization': 'Basic ' + (new Buffer.from(process.env.SPOTIFY_ID + ':' + process.env.SPOTIFY_SECRET).toString('base64'))
        },
        form: {
            grant_type: 'client_credentials'
        },
        json: true
    }
        
    return new Promise((resolve, reject) => {
        request.post(authOptions, function(error, response, body) {
            if (error) {
                reject(error)
            }
            const access_token = body.access_token
            resolve(access_token)
        })
    })
    
}

const SpotifyService = {
    spotifySearch(keyword) {
        return new Promise((resolve, reject) => {
            getAccessToken().then(token => {
                const formattedKeyword = keyword.trim().split(' ').join('%20')
                const searchEndpoint = `https://api.spotify.com/v1/search?query=${formattedKeyword}&type=artist,track`

                const searchOptions = {
                    url: searchEndpoint,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
                request(searchOptions, function (error, response, body) {
                    const jsonBody = JSON.parse(body)
                    const artists = jsonBody.artists ? jsonBody.artists.items.map((obj => ({
                        url: obj.external_urls,
                        id: obj.id,
                        images: obj.images,
                        name: obj.name,
                    }))) : []
                    const tracks = jsonBody.tracks ? jsonBody.tracks.items.map((obj => ({
                        url: obj.external_urls.spotify,
                        id: obj.id,
                        artist: obj.artists[0].name,
                        album: obj.album.name,
                        images: obj.album.images,
                        name: obj.name,
                    }))) : []
                    
                    const searchResults = {artists, tracks}
                    resolve(searchResults)
                });
            })
        })
    },
    //insert user's artist preference
    addArtist(knex, artist) {
        return knex('artists')
            .insert(artist)
            .returning('*')
            .then(artist => artist[0])
    },
    addTrack(knex, track) {
        return knex('tracks')
            .insert(track)
            .returning('*')
            .then(track => track[0])
    }
}

module.exports = SpotifyService