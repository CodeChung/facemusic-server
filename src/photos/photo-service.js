const cloudinary = require('cloudinary')
const request = require('request')
const faceApiEndpoint = 'https://westus.api.cognitive.microsoft.com/face/v1.0/detect?'




//converts data uri to url we can access online
photoToUrl = (uri) => {
    return new Promise(function(resolve, reject) {
        cloudinary.v2.uploader.upload(uri, { return_delete_token: 1 },
            function(error, result) {
                if (error) {
                    throw new Error(error)
                }
                const {url, public_id} = result
                resolve({url, public_id})
            }
        )
    })
}

//sends photo url to Face API, returns emotion data json
analyzePhoto = (photoData) => {
    return new Promise(function(resolve, reject) {
        const params = {
            'returnFaceId': 'true',
            'returnFaceLandmarks': 'false',
            'returnFaceAttributes': 'emotion'
        }
        const options = {
            uri: faceApiEndpoint,
            qs: params,
            body: '{"url": ' + '"' + photoData.url + '"}',
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': process.env.FACE_API_KEY
            }
        }
        request.post(options, (error, response, body) => {
            if (error) {
              reject(error)
            }
            let jsonResponse = JSON.parse(body)
            //empty array == no facial data, so let's delete photo to save space
            if (jsonResponse.length === 0) {
                deletePhoto(photoData.public_id)
                resolve({error: {message: 'Face is not recognized, please try again'}})
            }

            //pass object with facial attributes and emotion attributes
            const photoWithEmotion = {
                ...jsonResponse[0],
                ...photoData
            }
            resolve(photoWithEmotion)
        })
    })
}

//delete photo url if no facial data returned from face api
deletePhoto = (public_id) => {
    cloudinary.v2.uploader.destroy(public_id, function(error,result) {
        console.log(result, error) });
}

const PhotoService = {
    uploadPhoto(uri) {
        return new Promise(function(resolve, reject) {
            resolve(photoToUrl(uri)
            .then(photoData => analyzePhoto(photoData)))
        })
    }

}

module.exports = PhotoService
