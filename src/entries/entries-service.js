const emotionsService = require('../emotions/emotions-service')

const EntriesService = {
    saveEntry(knex, entry, user_id ) {
        const emotions = entry.emotions
        return emotionsService.saveEmotions(knex, emotions)
            .then(emotion_id => {
                const { notes, img, song } = entry
                
                const entryBody = {
                    user_id,
                    emotion_id,
                    img,
                    notes,
                    song: JSON.stringify(song)
                }
                
                return knex('entries')
                    .insert(entryBody)
                    .returning('*')
                    .then(res => res[0])
            })
    },
    getEntries(knex, user_id) {
        return knex('entries')
            .leftJoin('emotions', 'entries.emotion_id', 'emotions.id')
            .where({user_id})
            .returning('*')
            .then(entries => {
                const entriesByDate = {}

                //hash table with date-string (day only) as key; value == entry
                entries.forEach(entry => {
                    const date = new Date(entry.date_created).toString().slice(0, 15)

                    entriesByDate[date] = entry
                })
                return entriesByDate
            })
    },
    deleteEntry(knex, user_id, entry_id) {
        return knex('entries')
            .where({ user_id })
            .where('id', entry_id)
            .del()
    }
}

module.exports = EntriesService