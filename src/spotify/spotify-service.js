const request = require('request')

//api token expires 3600, should i request a new one each time a perform a search or save it and only call when time is up?

const emotionTable = {
    anger: {
        danceability: 1,
        energy: 1,
        loudness: 0,
        mode: 1,
        valence: 0,
        key: [0,1,2,3,4,5,6,7,8,9,10,11]
    },
    contempt: {
        danceability: 0,
        energy: 0.6,
        loudness: -30,
        mode: 0,
        valence: 0,
        key: [0,1,2,3,4,5,6,7,8,9,10,11]
    },
    disgust: {
        danceability: 0.3,
        energy: 0.3,
        loudness: -40,
        mode: 0,
        valence: 0,
        key: [0,1,2,3,4,5,6,7,8,9,10,11]
    },
    fear: {
        danceability: 0.7,
        energy: 0.5,
        loudness: -20,
        mode: 0,
        valence: 0,
        key: [0,1,2,3,4,5,6,7,8,9,10,11]
    },
    happiness: {
        danceability: 1,
        energy: 0.75,
        loudness: 0,
        mode: 1,
        valence: 1,
        key: [0,1,2,3,4,5,6,7,8,9,10,11]
    },
    neutral: {
        danceability: 0.5,
        energy: 0.5,
        loudness: -40,
        mode: 1,
        valence: 0.5,
        key: [0,1,2,3,4,5,6,7,8,9,10,11]
    },
    sadness: {
        danceability: 0,
        energy: 0,
        loudness: -60,
        mode: 0,
        valence: 0,
        key: [1,4,5]
    },
    surprise: {
        danceability: 1,
        energy: 1,
        loudness: 0,
        mode: 1,
        valence: 0.8,
        key: [0,1,2,3,4,5,6,7,8,9,10,11]
    }
}

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

getArtistSeeds = (knex, user_id) => {
    return knex('artists')
        .select('*')
        .where('user_id', user_id)
}

getTrackSeeds = (knex, user_id) => {
    return knex('tracks')
        .select('*')
        .where('user_id', user_id)
}

//chooses 5 random seeds to pass to Spotify Recommendations API
randomSeeds = (seeds) => {
    const length = seeds.length > 5 ? 5 : seeds.length
    const random = []
    
    for (let i = 0; i < length; i++) {
        const index = Math.floor(Math.random() * seeds.length)
        const removed = seeds.splice(index, 1)[0]
        random.push(removed.id)
    }
    return random
}

//convert emotion data from Face API to parameters for Spotify Recommendations API
emotionToSpotify = (emotions) => {
    let maxEmotion
    let maxVal = 0
    const trackAttributes = {
        danceability: 0,
        energy: 0,
        loudness: 0,
        mode: 0,
        valence: 0,
    }
    //loop through each emotion and add weighted value of attributes
    for (const emotion of Object.keys(emotions)) {
        const weight = emotions[emotion]
        const table = emotionTable[emotion]
        for (const attribute of Object.keys(table)) {
            const value = weight ? table[attribute] * weight : 0
            trackAttributes[attribute] += value
        }
        //choose random key from 
        if (emotions[emotion] >= maxVal)  {
            maxVal = emotions[emotion]
            maxEmotion = emotion
        }
    }
    const keyTable = emotionTable[maxEmotion].key
    const index = Math.floor(Math.random() * keyTable.length)
    // had to comment out key bc no matches with recommendations
    delete trackAttributes.key
    //round up mode
    trackAttributes.mode = trackAttributes.mode >= 0.5 ? 1 : 0
    return trackAttributes
}

formatRecommendationQuery = (artists, tracks, attributes) => {
    let endpoint = 'https://api.spotify.com/v1/recommendations?'
    endpoint += `limit=5&`
    endpoint += `seed_artists=${artists}&`
    endpoint += `seed_attributes=${tracks}&`
    for (const attr of Object.keys(attributes)) {
        endpoint += `target_${attr}=${attributes[attr]}&`
    }
    return endpoint
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
                    const searchResults = {artists, tracks, token, searchEndpoint}
                    resolve(searchResults)
                });
            })
        })
    },
    addSeed(knex, table, seed) {
        return knex(table)
            .insert(seed)
            .returning('*')
            .then(seed => seed[0])
    },
    deleteSeed(knex, table, id, user_id) {
        return knex(table)
            .where({id, user_id})
            .del()
            .returning('*')
            .then(seed => seed[0])
    },
    //search artists table for seeds with matching id
    //then do the same for tracks and return both
    getSeeds(knex, user_id) {
        let artists = []
        let tracks = []
        getArtistSeeds(knex, user_id)
            .then(artistSeeds => {
                artists = artistSeeds
                return artistSeeds
            })
        return getTrackSeeds(knex, user_id)
            .then(trackSeeds => {
                tracks = trackSeeds
                return {artists, tracks}
            })
    },
    getRecommendations(knex, user_id, emotions) {
        return new Promise((resolve, reject) => {
            this.getSeeds(knex, user_id)
                .then(results => {
                    const {artists, tracks} = results
                    const artistSeeds = randomSeeds(artists)
                    const trackSeeds = randomSeeds(tracks)
                    const trackAttributes = emotionToSpotify(emotions)
                    return formatRecommendationQuery(artistSeeds, trackSeeds, trackAttributes)
                })
                .then(url => {
                    getAccessToken().then(token => {

                        const searchOptions = {
                            url,
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        }
                        request(searchOptions, function (error, response, body) {
                            const jsonBody = JSON.parse(body)
                            const tracks = jsonBody.tracks ? jsonBody.tracks.map((obj => ({
                                url: obj.external_urls.spotify,
                                id: obj.id,
                                artist: obj.artists[0].name,
                                album: obj.album.name,
                                images: obj.album.images,
                                name: obj.name,
                            }))) : []
                            resolve(tracks)
                        })
                    })
                })
        })
    }
}

module.exports = SpotifyService