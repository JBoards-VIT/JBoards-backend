const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')
const User = require('../../models/User')
const Project = require('../../models/Project')
const Kanban = require('../../models/Kanban')
const { format } = require("date-fns")
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
                for (let j = 0; j < project.members.length; j++) {
                    const member = await User.findById(project.members[j])
                    projectCopy.members.push({
                        _id: member._id.toString(),
                        name: member.name,
                    })
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
            res.json({ status: "failed", message: "User does not exist" })
        }
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ status: "failed", "error": error.message })
    }
})

router.post("/get-deadlines", auth, [
    check('deadline', 'Deadline Date is required').isDate(),
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.json({ status: "failed", errors: errors.array() })
    }
    const { deadline } = req.body;
    const result = {
        deadlines: [],
    }
    try {
        const user = await User.findById(req.user.id)
        for (let i = 0; i < user.projects.length; i++) {
            const project = await Project.findById(user.projects[i])
            const kanban = await Kanban.findById(project.kanban)
            if (kanban.boards.length > 0) {
                for (let j = 0; j < kanban.boards.length; j++) {
                    const board = kanban.boards[j];
                    if (board.cards.length > 0) {
                        for (let k = 0; k < board.cards.length; k++) {
                            const card = await Card.findById(board.cards[k]);
                            if (format(card.deadlineDate, "yyyy-MM-dd") === deadline) {
                                result.deadlines.push({
                                    project: project.name,
                                    title: card.title,
                                    deadline: format(card.deadlineDate, "yyyy-MM-dd")
                                })
                            }
                        }
                    }
                }
            }
        }
        res.status(200).json({ status: "success", result: result })
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server error')
    }
})

router.post("/update", auth, [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Email is required').isEmail(),
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.json({ status: "failed", errors: errors.array() })
    }
    try {
        const user = await User.findById(req.user.id)
        user.name = req.body.name
        user.email = req.body.email
        if (req.body.registrationNumber) {
            user.registrationNumber = req.body.registrationNumber
        }
        await user.save()
        res.status(200).json({ status: "success", message: "Successfully Updated User", result: { user: user } })
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
        return res.json({ status: "failed", errors: errors.array() })
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