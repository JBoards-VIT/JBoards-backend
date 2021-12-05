const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')
const User = require('../../models/User')
const bcrypt = require('bcryptjs')
//@router POST api/users
//@desc  Get user details
//@access PUBLIC
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password')
        res.status(200).json({ status: "success", result: user })
    }
    catch (error) {
        console.error(error.message)
        res.status(500).json({ status: "failed", "error": error.message })
    }
})

router.get("/projects", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password")
        var projects = []
        if (user) {
            for (let i = 0; i < user.projects.length; i++) {
                let projectId = user.projects[i];
                const project = await Project.findById(projectId);
                const projectCopy = {
                    name: project.name,
                    _id: project._id.toString(),
                    members: []
                }
                projectCopy.members = []
                for (let j = 0; j < project.members.length; j++) {
                    const projectMemberUrl = await User.findById(project.members[j]).select("avatar")
                    projectCopy.members.push(projectMemberUrl)
                }
                projects.push(projectCopy);
            }
            res.status(200).json({
                status: "success", result: {
                    user,
                    projects
                }
            })
        }
        else {
            res.status(400).json({ status: "failed", message: "User does not exist" })
        }
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ status: "failed", "error": error.message })
    }
})

router.post("/update", auth, [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Email is required').isEmail(),
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: "failed", errors: errors.array() })
    }
    try {
        const user = await User.findById(req.user.id)
        user.name = req.body.name
        user.email = req.body.email
        if (req.body.registrationNumber) {
            user.registrationNumber = req.body.registrationNumber
        }
        await user.save()
        res.status(200).json({ status: "success", message: "Successfully Updated User" })
    }
    catch (error) {
        console.error(error.message)
        res.status(500).json({ status: "failed", "error": error.message })
    }
})

router.post("/change-password", auth, [
    check('password', 'Please enter a password with 8 or more characters').isLength({ min: 8 }),
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: "failed", errors: errors.array() })
    }
    const { password } = req.body
    try {
        const user = await User.findById(req.user.id)
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(password, salt)
        await user.save()
        res.status(200).json({ status: "success", message: "Successfully Changed Password" })
    }
    catch (error) {
        console.error(error.message)
        res.status(500).json({ status: "failed", "error": error.message })
    }
})

module.exports = router