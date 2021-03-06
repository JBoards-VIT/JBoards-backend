const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')
const Project = require('../../models/Project')
const Kanban = require('../../models/Kanban')
const User = require('../../models/User')

router.get('/:projectId', auth, async (req, res) => {
    const projectId = req.params.projectId;
    try {
        const project = await Project.findById(projectId);
        const users = [];
        if (project) {
            for (let i = 0; i < project.members.length; i++) {
                let userId = project.members[i];
                const user = await User.findById(userId);
                users.push(user);
            }
            res.json({
                status: "success", result: {
                    project,
                    members: users
                }
            })
        }
        else {
            res.json({ status: "failed", message: "Project does not exist" })
        }
    }
    catch (error) {
        console.error(error.message)
        res.status(500).send('Server error')
    }
})

router.post('/create', auth, [check('title', 'Project Title is required').not().isEmpty()], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.json({ status: "failed", errors: errors.array() })
    }
    const { title } = req.body
    try {
        const user = await User.findById(req.user.id)
        let isPresent = false;
        for (let i = 0; i < user.projects.length; i++) {
            const project = await Project.findById(user.projects[i])
            if (project.name === title) {
                isPresent = true;
            }
        }
        if (isPresent) {
            res.json({ status: "failed", errors: [{ msg: "Project Already Exists" }] })
        }
        else {
            const kanban = new Kanban()
            await kanban.save()
            const newProject = new Project({
                name: title,
                kanban: kanban._id.toString(),
            })
            newProject.members.push(req.user.id)
            await newProject.save()
            user.projects.push(newProject._id.toString())
            await user.save()
            res.status(201).json({ status: "success", result: newProject })
        }
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
        res.json({ status: "failed", errors: errors.array() })
    }
    const { accessCode } = req.body
    try {
        const project = await Project.findOne({ accessCode: accessCode });
        if (project) {
            if (project.members.indexOf(req.user.id) === -1) {
                project.members.push(req.user.id)
                await project.save()
                const user = await User.findById(req.user.id)
                user.projects.push(project._id.toString())
                await user.save()
                res.status(201).json({ status: "success", message: "Successfully Added to the Project" })
            }
            else {
                res.json({ status: "failed", errors: [{ msg: "Already a member of this Project" }] })
            }
        }
        else {
            res.json({ status: "failed", errors: [{ msg: 'Invalid Access Code' }] })
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
        res.json({ status: "failed", errors: errors.array() })
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
                res.json({ status: "failed", errors: [{ msg: 'User not found' }] })
            }
        }
        else {
            res.json({ status: "failed", errors: [{ msg: 'Project not found' }] })
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
        res.json({ status: "failed", errors: errors.array() })
    }
    const { projectName, projectId } = req.body
    try {
        const user = await User.findById(req.user.id)
        let isPresent = false;
        for (let i = 0; i < user.projects.length; i++) {
            const project = await Project.findById(user.projects[i])
            if (project.name === projectName) {
                isPresent = true;
            }
        }
        if (isPresent) {
            res.json({ status: "failed", errors: [{ msg: "Project Already Exists" }] })
        }
        else {
            const project = await Project.findById(projectId);
            if (project) {
                project.name = projectName
                await project.save()
                res.status(200).json({ status: "success", message: "Successfully Updated", project: project })
            }
            else {
                res.json({ status: "failed", errors: [{ msg: 'Project not found' }] })
            }
        }
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server error')
    }
})

module.exports = router;