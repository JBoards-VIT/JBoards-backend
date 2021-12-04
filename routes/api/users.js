const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')

const User = require('../../models/User')

//@router POST api/users
//@desc  Get user details
//@access PUBLIC
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password')
        res.json({ status: "success", result: user })
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send('Server error')
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
                projects.push(project);
            }
            res.json({
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
        res.status(500).send('Server error')
    }
})

module.exports = router