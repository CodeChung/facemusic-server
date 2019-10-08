const express = require('express')
const xss = require('xss')
const logger = require('../../logger')
const path = require('path')
const UsersService = require('./users-service')
const AuthService = require('../auth/auth-service')

const usersRouter = express.Router()
const jsonBodyParser = express.json()

usersRouter
    .route('/register')
    .post(jsonBodyParser, (req, res, next) => {
        const { password, user_name } = req.body

        for (const field of ['user_name', 'password']) {
            if (!req.body[field]) {
                return res.status(400).json({
                    error: `Missing '${field}' in request body`
                })
            }
        }

        UsersService.hasUserWithUserName(
            req.app.get('db'),
            user_name
        )
            .then(hasUserWithUserName => {
                if (hasUserWithUserName) {
                    return res.status(400).json({ error: `Username already taken`})
                }

                return UsersService.hashPassword(password)
                    .then(hashedPassword => {
                        const newUser = {
                            username: user_name,
                            password: hashedPassword,
                        }
                        return UsersService.insertUser(
                            req.app.get('db'),
                            newUser
                        )
                            .then(user => {
                                res
                                    .status(201)
                                    .location(path.posix.join(req.originalUrl, `/${user.id}`))
                                    .json(UsersService.serializeUser(user))
                            })
                    })
                
            })
            .catch(next)
    })

usersRouter
    .route('/login')
    .post(jsonBodyParser, (req, res, next) => {
        const { user_name, password } = req.body
        const loginUser = { user_name, password }

        for (const [key, value] of Object.entries(loginUser)) {
            if (value == null) {
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                })
            }
        }

        UsersService.getUserWithUserName(
            req.app.get('db'),
            loginUser.user_name
        )
            .then(dbUser => {
                if (!dbUser) {
                    return res.status(400).json({
                        error: 'User does not exist'
                    })
                }

                return AuthService.comparePasswords(loginUser.password, dbUser.password)
                    .then(passwordsMatch => {
                        if (!passwordsMatch) {
                            return res.status(400).json({
                                error: 'Incorrect username or password'
                            })
                        }

                        const sub = dbUser.username
                        const payload = { user_id: dbUser.id }
                        res.send({
                            authToken: AuthService.createJwt(sub, payload)
                        })
                    })
            })
            .catch(next)

    })

module.exports = usersRouter