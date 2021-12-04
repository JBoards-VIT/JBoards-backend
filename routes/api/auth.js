const express = require('express')
const router = express.Router()
const User = require('../../models/User')
const jwt = require('jsonwebtoken')
const config = require('config')
const bcrypt = require('bcryptjs')
const gravatar = require('gravatar')
const { check, validationResult } = require('express-validator')
const auth = require('../../middleware/auth')

router.post('/register', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { name, email, password } = req.body
    try {
        let user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ errors: [{ msg: 'User already exists' }] })
        }
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        })
        user = new User({
            name,
            email,
            avatar,
            password
        })
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(password, salt)
        await user.save()
        const payload = {
            user: {
                id: user.id
            }
        }
        jwt.sign(payload,
            config.get('jwtsecret'),
            (err, token) => {
                if (err) throw err
                res.json({ token })
            }) //change this : the expire thingy { expiresIn: 360000000 },
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server error')
    }
})
router.post('/login', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ status: "failed", errors: errors.array() })
    }
    const { email, password } = req.body
    try {
        let user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ status: "failed", errors: [{ msg: 'Invalid credentials' }] })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ status: "failed", errors: [{ msg: 'Invalid credentials' }] })
        }
        const payload = {
            user: {
                id: user.id
            }
        }
        jwt.sign(payload,
            config.get('jwtsecret'),
            (err, token) => {
                if (err) throw err
                res.json({ status: "success", token: token })
            }) //change this : the expire thingy { expiresIn: 360000000 },
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server error')
    }
})

router.get("/jwtValid", auth, (req, res) => {
    res.status(200).json({
        status: "success",
        message: "JWT Valid"
    })
})

module.exports = router