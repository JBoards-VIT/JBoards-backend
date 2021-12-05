const jwt = require('jsonwebtoken')
const config = require('config')

module.exports = function (req, res, next) {
    const token = req.header('x-auth-token')
    if (!token) {
        return res.json({ status: "failed", errors: [{ msg: 'Authorization Token is required' }] })
    }
    try {
        const decoded = jwt.verify(token, config.get('jwtsecret'))
        req.user = decoded.user
        next()
    } catch (error) {
        res.json({ status: "failed", errors: [{ msg: 'Authorization Token Invalid' }] })
    }
}