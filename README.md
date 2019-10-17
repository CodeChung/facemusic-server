# [FaceJams](https://codechung-bookmarks-app.now.sh/)
## Introduction
FaceJams is a React application that allows users to find musical recommendations based on the emotions depicted in their faces. 

![enter image description here](https://snipboard.io/XwaFKy.jpg)

**How it works**
1. Add your musical preferences
![enter image description here](https://snipboard.io/ZkzQo5.jpg)
2. Take a picture
![enter image description here](https://snipboard.io/f4kHK3.jpg)
3. Save songs that reflect your mood
![enter image description here](https://snipboard.io/uPQ9a2.jpg)
# Getting Started

### Installing

Clone the repository and download dependencies.

```
$ git clone https://github.com/CodeChung/facemusic-server.git
$ cd facemusic-server
$ npm install

```
This app is dependent on Microsoft Face API and Spotify API.

### Launching

Start the development server.

```
$ npm run dev

```

This will automatically open a new browser window with the project.

### Testing

Run tests with Jest and Enzyme.

```
$ npm run test
```


# FaceJams API (https://hc9825-goala-app.now.sh)
## Required:
- Authorization: Bearer {ApiToken}
## Endpoints:
### /api/entries
- `GET` - gets entries that match user id
- `POST` - creates new entry
        - **body**: `{ img: (img link), song,(Spotify song object), emotions: (Face API emotions object) }` 
### /api/photos
- `POST` - sends photo data uri and gets back a link
        - **body**: `{ img: (data uri) }` 
### /api/spotify
- /search/:keyword `GET` - returns Spotify songs and artists based on keyword
- /vibes `GET` - returns user specific vibes
- /vibes `POST` - post a user specific vibe
        - **header**: `{ type: 'artist' || 'track' }`
        - **body**: `{ name" (string), img: (url), artist: (string), album: (string) }`
- /vibes `DELETE` - delete a user specific vibe
        - **header**: `{ type: 'artist' || 'track' }`
        - **body**: `{ name" (string), img: (url), artist: (string), album: (string) }`
- /recommendations `POST` - Gets an array of Spotify Recommendations based on the emotions object
        - **body**: `{ Face API emotions object }`
### /api/users
- /login `POST` - Creates a new user
        - **body**: `{ user_name: (string), password: (string)}`
- /register `POST` - Creates a new user
        - **body**: `{ user_name: (string), password: (string)}`


## Technologies Used:
* Node.js
* Postgres
* JWT Authentication
