const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Emotions Endpoints', function() {
    let db

    const {
        testUsers,
        testTracks,
        testArtists,
        testEntries,
        testEmotions,
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

    describe('GET /api/entries', () => {
        beforeEach('insert users', () => helpers.seedUsers(db, testUsers))
        
        context(`Given no seeds`, () => {
            it(`responds with 200 and an empty object`, () => {
                return supertest(app)
                    .get('/api/entries')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, {})
            })
        })
        context(`Given there are entries in the database`, () =>  {
            beforeEach('insert entriess', () => {
                helpers.seedTracks(db, testTracks)
                helpers.seedArtists(db, testArtists)
                helpers.seedEmotions(db, testEmotions)
                helpers.seedEntries(db, testEntries)
            })

            it('responds with 200 and object of entries for specific id', () => {
                const user = testUsers[0]
                const userId = user.id
                const entries = testEntries.filter(entry => entry.user_id === userId)
            
                return supertest(app)
                    .get('/api/entries')
                    .set('Authorization', helpers.makeAuthHeader(user))
                    .expect(200, )
            })
        })
    })

    describe('POST /api/entries/new', () => {
        beforeEach('insert users', () => helpers.seedUsers(db, testUsers))
        
        context(`Adding a new entry`, () => {
            const requiredFields = ['img',]

            requiredFields.forEach(field => {
                const testUser = testUsers[1]
                const testEntry = JSON.stringify(testEntries[0])

                it(`responds with 400 and error message when '${field} is missing`, () => {
                    delete testEntry[field]
                    return supertest(app)
                        .post('/api/entries/new')
                        .set('Authorization', helpers.makeAuthHeader(testUser))
                        .send(testEntry)
                        .expect(400, {
                            error: {message: `Must include ${field} in request`}
                        })
                })
            })
        })
    })
})