const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeUsersArray() {
    return [
        {
            id: 1,
            username: 'test-user-1',            
            password: 'password',
            date_created: new Date('2029-01-22T16:28:32.615Z'),
        },
        {
            id: 2,
            username: 'test-user-2',            
            password: 'password',
            date_created: new Date('2029-01-22T16:28:32.615Z'),
        },
        {
            id: 3,
            username: 'test-user-3',            
            password: 'password',
            date_created: new Date('2029-01-22T16:28:32.615Z'),
        }
    ]
}

function makeTracksArray() {
    return [
        {
            id: '7vgTNTaEz3CsBZ1N4YQalM',
            name: 'Ghost Town',
            img: 'https://i.scdn.co/image/05cf2f8b56e595bcbf50fccb894f5fb6c2427750',
            artist: 'Kanye West',
            album: 'ye',
            user_id: 1,
        },
        {
            id: '3U21A07gAloCc4P7J8rxcn',
            name: 'All Mine',
            img: 'https://i.scdn.co/image/05cf2f8b56e595bcbf50fccb894f5fb6c2427750',
            artist: 'Kanye West',
            album: 'ye',
            user_id: 1,
        },
        {
            id: '2t8yVaLvJ0RenpXUIAC52d',
            name: 'a lot',
            img: 'https://i.scdn.co/image/e89fed2244d8ea00f46312790c3a3b9f4092e5a6',
            artist: '21 Savage',
            album: 'i am > i was',
            user_id: 2,
        }
    ]
}

function makeArtistsArray() {
    return [
        {
            id: '0g9vAlRPK9Gt3FKCekk4TW',
            name: 'Ab-Soul',
            img: 'https://i.scdn.co/image/eff7433105ae6f6ed6ffb6b03d46aaee8d6811ae',
            user_id: 1
        },
        {
            id: '0LcJLqbBmaGUft1e9Mm8HV',
            name: 'ABBA',
            img: 'https://i.scdn.co/image/733e98edfdc11feea07914532603c080fa432159',
            user_id: 1
        },
        {
            id: '5eAWCfyUhZtHHtBdNk56l1',
            name: 'System Of A Down',
            img: 'https://i.scdn.co/image/cc1b320bd06c6167997e65fd5e38d35c1a26caf1',
            user_id: 3
        }
    ]
}

function makeEmotionsArray() {
    return [
        {
            anger: .322,
            contempt: .322,
            disgust: .322,
            fear: .322,
            happiness: .322,
            neutral: .322,
            sadness: .322,
            surprise: .322,
        },
        {
            anger: .212,
            contempt: .522,
            disgust: .822,
            fear: .322,
            happiness: .322,
            neutral: .322,
            sadness: .322,
            surprise: .322,
        },
        {
            anger: .122,
            contempt: .322,
            disgust: .322,
            fear: .322,
            happiness: .322,
            neutral: .322,
            sadness: .322,
            surprise: .322,
        },
        {
            anger: .022,
            contempt: .322,
            disgust: .322,
            fear: .322,
            happiness: .322,
            neutral: .322,
            sadness: .322,
            surprise: .322,
        },
        {
            anger: .822,
            contempt: .322,
            disgust: .322,
            fear: .322,
            happiness: .322,
            neutral: .322,
            sadness: .322,
            surprise: .322,
        }
    ]
}

function makeEntriesArray() {
    return [
        {
            id: 1,
            date_created: new Date(),
            notes: 'Today was a good day',
            img: 'img.com',
            song: {artist: 'Abba', title: 'Abba', img: 'src.jpg'},
            user_id: 1,
            emotion_id: 1,
        },
        {
            id: 2,
            date_created: new Date(),
            notes: 'Today was a great day',
            img: 'img.com',
            song: {artist: 'Acca', title: 'Acca', img: 'src.jpg'},
            user_id: 2,
            emotion_id: 2,
        },
        {
            id: 3,
            date_created: new Date(),
            notes: 'Today was a bad day',
            img: 'img.com',
            song: {artist: 'Adda', title: 'Adda', img: 'src.jpg'},
            user_id: 1,
            emotion_id: 3,
        },
        {
            id: 4,
            date_created: new Date(),
            notes: 'Today was a good day',
            img: 'img.com',
            song: {artist: 'Abeea', title: 'Aeea', img: 'src.jpg', emotions: {}},
            user_id: 1,
            emotion_id: 4,
        }
    ]
}

function makeFixtures() {
    const testUsers = makeUsersArray()
    const testTracks = makeTracksArray()
    const testArtists = makeArtistsArray()
    const testEntries = makeEntriesArray()
    const testEmotions = makeEmotionsArray()

    return { testUsers, testTracks, testArtists, testEntries, testEmotions }
}

function cleanTables(db) {
    return db.raw(
        `TRUNCATE
            users RESTART IDENTITY CASCADE;
        TRUNCATE
            emotions RESTART IDENTITY CASCADE;
        `
    )
}

function seedUsers(db, users) {
    const preppedUsers = users.map(user => ({
        ...user,
        password: bcrypt.hashSync(user.password, 1)
    }))
    return db.into('users').insert(preppedUsers)
}

function seedEmotions(db, emotions) {
    return db.into('emotions').insert(emotions)
        .returning('*')
        .then(res => res)
}

function seedEntries(db, entries) {
    return db.into('entries').insert(entries)
        .returning('*')
        .then(res => res)
}

function seedArtists(db, artists) {
    return db.into('artists').insert(artists)
        .returning('*')
        .then(res => res)
}

function seedTracks(db, tracks) {
    return db.into('tracks').insert(tracks)
        .returning('*')
        .then(res => res)
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({ user_id: user.id }, secret, {
        subject: user.username,
        algorithm: 'HS256'
    })
    return `bearer ${token}`
}


module.exports = {
    makeArtistsArray,
    makeFixtures,
    makeEmotionsArray,
    makeEntriesArray,
    makeTracksArray,
    makeUsersArray,
    cleanTables,
    makeAuthHeader,
    seedUsers,
    seedEmotions,
    seedEntries,
    seedArtists,
    seedTracks,
}