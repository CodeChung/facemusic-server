const AuthService = require('../auth/auth-service')

function requireAuth(req, res, next) {
    //hook this to protected endpoint requests with Authorization header: Bearer ${token}
    const authToken = req.get('Authorization') || ''

    let bearerToken
    if (!authToken.toLowerCase().startsWith('bearer ')) {
        return res.status(401).json({ error: 'Missing bearer token'})
    } else {
        bearerToken = authToken.slice(7, authToken.length)
    }

    const payload = AuthService.verifyJwt(bearerToken)

    return AuthService.getUserWithUserName(
        req.app.get('db'),
        payload.sub
    )
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Unauthorized request' })
            }
            req.user = user
            next()
        })
        .catch(err => {
            console.error(err)
            next(err)
        })
}

module.exports = { requireAuth }