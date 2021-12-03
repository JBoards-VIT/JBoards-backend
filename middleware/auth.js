const jwt = require('jsonwebtoken')
const config = require('config')

module.exports = function (req, res, next) {
    // Get the token from the header
    const token = req.header('x-auth-token')
    // Check if there's no token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' })
    }
    // Vertify the token
    try {
        const decoded = jwt.verify(token, config.get('jwtsecret'))
        req.user = decoded.user
        next()
    } catch (error) {
        res.status(401).json({
            msg: 'No authorisation as token is not valid'
        })
    }
}