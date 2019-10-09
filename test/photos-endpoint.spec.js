const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Photos Endpoints', function() {
    let db

    const {
        testUsers,
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

    describe('POST /api/photos', () => {
        beforeEach('insert users', () => helpers.seedUsers(db, testUsers))
        
        context(`Adding new photo`, () => {
            it(`responds with 400 and error message when 'img' is missing in  body`, () => {
                return supertest(app)
                    .post('/api/photos')
                    .send({})
                    .expect(400, {
                        error: { message: `No data sent with image post request`}
                    })
            })

            it(`responds with 400 and error message when 'img' is not data uri`, () => {
                return supertest(app)
                    .post('/api/photos')
                    .send({
                    })
                    .expect(400, {
                        error: { message: `No data sent with image post request`}
                    })
            })
        })

    })
})