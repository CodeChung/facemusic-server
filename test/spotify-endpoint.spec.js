const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Spotify Endpoints', function() {
    let db

    const {
        testUsers,
        testTracks,
        testArtists
    } = helpers.makeFixtures()

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL
        })

        app.set('db', db)
    })

    after('disconnection from db', () => db.destroy())

    before('cleanup', () => helpers.cleanTables(db))

    afterEach('cleanup', () => helpers.cleanTables(db))

    describe('GET /api/music', () => {
        it('responds with 200 and correct message', () => {
            return supertest(app)
            .get('/api/music')
            .expect(200, 'yolo')
        })
        
    })

    describe('GET /api/music/vibes', () => {
        beforeEach('insert users', () => helpers.seedUsers(db, testUsers))
        
        context(`Given no seeds`, () => {
            it(`responds with 200 and an empty object`, () => {
                return supertest(app)
                    .get('/api/music/vibes')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, {
                        artists: [], 
                        tracks: []
                    })
            })
        })
        context(`Given there are artists in the database`, () =>  {
            beforeEach('insert artists and tracks', () => {
                helpers.seedTracks(db, testTracks)
                helpers.seedArtists(db, testArtists)
            })

            it('responds with 200 and object of artists and tracks for specific id', () => {
                const user = testUsers[0]
                const userId = user.id
                const artists = testArtists.filter(artist => artist.user_id === userId)
                const tracks = testTracks.filter(track => track.user_id === userId)
                const expectedSeeds = {
                    artists,
                    tracks
                }
                return supertest(app)
                    .get('/api/music/vibes')
                    .set('Authorization', helpers.makeAuthHeader(user))
                    .expect(200, expectedSeeds)
            })
        })
    })

    describe('POST /api/music/vibes', () => {
        beforeEach('insert users', () => helpers.seedUsers(db, testUsers))

        context('Not specifying seed type', () => {
            it('responds 400 and error message', () => {
                const seed = {}
                const testUser = testUsers[0]

                return supertest(app)
                    .post('/api/music/vibes')
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(400, { error: {message: `vibe post missing type header`} })
            })
        })

        context('Adding a track', () => {
            const requiredFields = ['name', 'id', 'img', 'artist', 'album']

            requiredFields.forEach(field => {
                const testUser = testUsers[1]
                const testTrack = {
                    name: 'ABC',
                    id: '5SdB3onMcO9ZBoKrdvCqhR',
                    img: 'https://i.scdn.co/image/1739cf1cf49e632ab6b2f50d0e82538c5e904b48',
                    artist: 'The Jackson 5',
                    album: 'The Ultimate Collection: Jackson 5',
                    user_id: testUser.id
                }

                it(`responds with 400 and error message when '${field} is missing`, () => {
                    delete testTrack[field]
                    return supertest(app)
                        .post('/api/music/vibes')
                        .set('Authorization', helpers.makeAuthHeader(testUser))
                        .set('type', 'track')
                        .send(testTrack)
                        .expect(400, {
                            error: {message: `Track vibe body missing ${field}`}
                        })
                })
                
            })
            it('creates a track, responding with 201 and new track', () => {
                const testUser = testUsers[1]
                const newTrack = {
                    name: 'ABC',
                    id: '5SdB3onMcO9ZBoKrdvCqhR',
                    img: 'https://i.scdn.co/image/1739cf1cf49e632ab6b2f50d0e82538c5e904b48',
                    artist: 'The Jackson 5',
                    album: 'The Ultimate Collection: Jackson 5',
                    user_id: testUser.id
                }

                return supertest(app)
                    .post('/api/music/vibes')
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .set('type', 'track')
                    .send(newTrack)
                    .expect(201)
                    .expect(res => {
                        db
                            .from('tracks')
                            .select('*')
                            .where({ id: res.body.id })
                            .first()
                            .then(row => {
                                expect(row.name).to.eql(newTrack.name)
                                expect(row.id).to.eql(newTrack.id)
                                expect(row.user_id).to.eql(newTrack.user_id)
                                expect(row.artist).to.eql(newTrack.artist)
                                expect(row.img).to.eql(newTrack.img)
                                expect(row.album).to.eql(newTrack.album)
                            })
                    })
            })
        })

        context('Adding an artist', () => {
            const requiredFields = ['name', 'id', 'img']
           
            requiredFields.forEach(field => {
                const testUser = testUsers[1]
                const testArtist = {
                    name: 'A Tribe Called Quest',
                    id: '09hVIj6vWgoCDtT03h8ZCa',
                    img: 'https://i.scdn.co/image/6f987ab74c72f0c50b19b05ea775bc4033c57706',
                    user_id: testUser.id
                }

                it(`responds with 400 and error message when '${field} is missing`, () => {
                    delete testArtist[field]
                    return supertest(app)
                        .post('/api/music/vibes')
                        .set('Authorization', helpers.makeAuthHeader(testUser))
                        .set('type', 'artist')
                        .send(testArtist)
                        .expect(400, {
                            error: {message: `Artist vibe body missing ${field}`}
                        })
                })
                
            })
            it('creates an artist, responding with 201 and new artist', () => {
                const testUser = testUsers[1]
                const newArtist = {
                    name: 'A Tribe Called Quest',
                    id: '09hVIj6vWgoCDtT03h8ZCa',
                    img: 'https://i.scdn.co/image/6f987ab74c72f0c50b19b05ea775bc4033c57706',
                    user_id: testUser.id
                }

                return supertest(app)
                    .post('/api/music/vibes')
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .set('type', 'artist')
                    .send(newArtist)
                    .expect(201)
                    .expect(res => {
                        db
                            .from('artists')
                            .select('*')
                            .where({ id: res.body.id })
                            .first()
                            .then(row => {
                                expect(row.name).to.eql(newArtist.name)
                                expect(row.id).to.eql(newArtist.id)
                                expect(row.user_id).to.eql(newArtist.user_id)
                                expect(row.img).to.eql(newArtist.img)
                            })
                    })
            })
        })
    })
})