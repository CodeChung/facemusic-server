const emotionsService = {
    saveEmotions(knex, emotions) {
        knex('emotions')
            .insert(emotions)
            .returning('id')
            .then(emotionId => emotionId[0])
    }
}

module.exports = emotionsService