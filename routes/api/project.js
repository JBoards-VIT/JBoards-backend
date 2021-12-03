const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')

const Project = require('../../models/Project')
const Kanban = require('../../models/Kanban')
const User = require('../../models/User')

router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
        const result = { user, projects: [] }
        user.projects.forEach(async (projectId) => {
            let project = await Project.findById(projectId)
            result.projects.push(project)
        })
        res.json({ status: "success", result: result })
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server error')
    }
})

router.post('/create', auth, [check('title', 'Project Title is required').not().isEmpty()], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: "failed", errors: errors.array() })
    }
    const { title } = req.body
    try {
        const kanban = new Kanban()
        await kanban.save()
        const project = new Project({
            title,
            kanban: kanban._id,
        })
        project.members.push(req.user.id)
        await project.save()
        const user = await User.findById(req.user.id)
        user.projects.push(project._id)
        await user.save()
        res.status(201).json({ status: "success", result: project })
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server error')
    }
})

router.post('/join', auth, [
    check('accessCode', 'Access Code is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: "failed", errors: errors.array() })
    }
    const { accessCode } = req.body
    try {
        const project = await Project.find({ accessCode: accessCode });
        if (project) {
            project.members.push(req.user.id)
            await project.save()
            const user = await User.findById(req.user.id)
            user.projects.push(project._id)
            await user.save()
            res.status(201).json({ status: "success", result: project })
        }
        else {
            res.status(400).json({ status: "failed", errors: [{ msg: 'Invalid Access Code' }] })
        }
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server error')
    }
})

router.post("/removeMember", auth, [
    check('userId', 'User Id is required').not().isEmpty(),
    check('projectId', 'Project Id is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { userId, projectId } = req.body
    try {
        const project = await Project.findById(projectId);
        if (project) {
            const index = project.members.indexOf(userId)
            if (index > -1) {
                project.members.splice(index, 1)
                await project.save()
                const user = await User.findById(userId)
                const index2 = user.projects.indexOf(projectId)
                user.projects.splice(index2, 1)
                await user.save()
                res.status(200).json({ status: "success", message: "Successfully Updated" })
            }
            else {
                res.status(400).json({ status: "failed", errors: [{ msg: 'User not found' }] })
            }
        }
        else {
            res.status(400).json({ status: "failed", errors: [{ msg: 'Project not found' }] })
        }
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server error')
    }

})

router.post("/update", auth, [
    check('projectName', 'User Id is required').not().isEmpty(),
    check('projectId', 'Project Id is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { projectName, projectId } = req.body
    try {
        const project = await Project.findById(projectId);
        if (project) {
            project.name = projectName
            await project.save()
            res.status(200).json({ status: "success", message: "Successfully Updated" })
        }
        else {
            res.status(400).json({ status: "failed", errors: [{ msg: 'Project not found' }] })
        }
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server error')
    }
})

module.exports = router;