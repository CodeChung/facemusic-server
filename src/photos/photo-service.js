const cloudinary = require('cloudinary')
const request = require('request')
const faceApiEndpoint = 'https://westus.api.cognitive.microsoft.com/face/v1.0/detect?'



//should i keep this in the object
//sends photo url to face api for analysis
// analyzePhoto = (url) => {
//     const params = {
//         'returnFaceId': 'true',
//         'returnFaceLandmarks': 'false',
//         'returnFaceAttributes': 'emotion'
//     }
//     const options = {
//         uri: faceApiEndpoint,
//         qs: params,
//         body: '{"url": ' + '"' + url + '"}',
//         headers: {
//             'Content-Type': 'application/json',
//             'Ocp-Apim-Subscription-Key': process.env.FACE_API_KEY
//         }
//     }
//     request.post(options, (error, response, body) => {
//         if (error) {
//           console.log('Error: ', error);
//           return
//         }
//         let jsonResponse = JSON.stringify(JSON.parse(body), null, '  ')
//         return jsonResponse
//     })
// }

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
              console.log('Error: ', error);
              reject(error)
            }
            let jsonResponse = JSON.stringify(JSON.parse(body), null, '  ')
            console.log('length', body.length)
            console.log(body)
            console.log(typeof body)
            console.log(body[0])
            if (body.length === 0) {
                resolve(['yolo'])
            }
            resolve(jsonResponse)
        })
    })
}

//converts data uri to url we can access online
photoToUrl = (uri) => {
    return new Promise(function(resolve, reject) {
        cloudinary.v2.uploader.upload(uri, { return_delete_token: 1 },
            function(error, result) {
                if (error) {
                    throw new Error(error)
                }
                const {url, delete_token} = result
                //make call to Face API and store in photoinfo
                resolve({url, delete_token})
            }
        )
    })
}

deletePhoto = (delete_token) => {
    console.log('delete')
    console.log(delete_token)
}

const photoService = {
    uploadPhoto(uri) {
        photoToUrl(uri)
            .then(photoData => analyzePhoto(photoData))
            .then(res => console.log('face', res))
    }

}

module.exports = photoService
