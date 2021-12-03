const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')

const Project = require('../../models/Project')
const Kanban = require('../../models/Kanban')
const User = require('../../models/User')
const Card = require('../../models/Card')

router.get("/:projectId", auth, async (req, res) => {
    const { projectId } = req.params
    const result = {
        boards: [],
    }
    try {
        const project = await Project.findById(projectId)
        if (project) {
            result.name = project.name
            const kanban = await Kanban.findById(project.kanban)
            if (kanban.boards.length > 0) {
                kanban.boards.forEach((board) => {
                    const boardResult = { id: board.id, name: board.name, cards: [] }
                    if (board.cards.length > 0) {
                        board.cards.forEach(async (cardId) => {
                            const card = await Card.findById(cardId)
                            boardResult.cards.push(card)
                        })
                    }
                    result.boards.push(boardResult)
                })
            }
            res.json({ status: "success", result: result })
        }
        else {
            res.status(400).json({ status: "failed", errors: [{ msg: 'Project not found' }] })
        }
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server error')
    }
})

router.post("/create/board", auth, [
    check('name', 'Board name is required').not().isEmpty(),
    check('kanbanId', 'Kanban Id is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { name, kanbanId } = req.body
    try {
        const kanban = await Kanban.findById(kanbanId);
        if (kanban) {
            kanban.boards.push({
                name,
            })
            await kanban.save();
            const updatedKanban = await Kanban.findById(kanbanId);
            res.status(201).json({ status: "success", result: updatedKanban })
        }
        else {
            res.status(400).json({ status: "failed", errors: [{ msg: 'Kanban not found' }] })
        }
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server error')
    }
})

router.post("/delete/board", auth, [
    check('boardId', 'Board Id is required').not().isEmpty(),
    check('kanbanId', 'Kanban Id is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { boardId, kanbanId } = req.body
    try {
        const kanban = await Kanban.findById(kanbanId);
        if (kanban) {
            kanban.boards = kanban.boards.filter((board) => board.id !== boardId)
            await kanban.save();
            res.status(200).json({ status: "success", message: "Successfully Updated" })
        }
        else {
            res.status(400).json({ status: "failed", errors: [{ msg: 'Kanban not found' }] })
        }
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server error')
    }
})

router.post("/update/board", auth, [
    check('name', 'Board name is required').not().isEmpty(),
    check('boardId', 'Board Id is required').not().isEmpty(),
    check('kanbanId', 'Kanban Id is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { name, boardId, kanbanId } = req.body
    try {
        const kanban = await Kanban.findById(kanbanId);
        if (kanban) {
            const boardIndex = kanban.boards.findIndex((board) => board.id === boardId)
            kanban.boards[boardIndex].name = name;
            await kanban.save();
            res.status(201).json({ status: "success", message: "Successfully Updated" })
        }
        else {
            res.status(400).json({ status: "failed", errors: [{ msg: 'Kanban not found' }] })
        }
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server error')
    }
});

router.post("/create/card", auth, [
    check('title', 'Card title is required').not().isEmpty(),
    check('boardId', 'Board Id is required').not().isEmpty(),
    check('kanbanId', 'Kanban Id is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { title, boardId, kanbanId } = req.body
    try {
        const kanban = await Kanban.findById(kanbanId);
        if (kanban) {
            const boardIndex = kanban.boards.findIndex((board) => board.id === boardId)
            const card = new Card({
                title
            })
            await card.save()
            kanban.boards[boardIndex].cards.push(card._id)
            await kanban.save()
            res.status(201).json({ status: "success", message: "Successfully Added Card" })
        }
        else {
            res.status(400).json({ status: "failed", errors: [{ msg: 'Kanban not found' }] })
        }
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server error')
    }
})

router.post("/delete/card", auth, [
    check('cardId', 'Card Id is required').not().isEmpty(),
    check('boardId', 'Board Id is required').not().isEmpty(),
    check('kanbanId', 'Kanban Id is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { cardId, boardId, kanbanId } = req.body
    try {
        const kanban = await Kanban.findById(kanbanId);
        if (kanban) {
            const boardIndex = kanban.boards.findIndex((board) => board.id === boardId)
            const cardIndex = kanban.boards[boardIndex].cards.indexOf(cardId)
            if (cardIndex > -1) {
                kanban.boards[boardIndex].cards.splice(cardIndex, 1)
                await kanban.save()
                Card.deleteOne({ id: cardId }, (err) => {
                    if (err) {
                        console.log(err)
                        res.status(500).send('Server error')
                    }
                    else {
                        res.status(200).json({ status: "success", message: "Successfully Deleted Card" })
                    }
                })
            }
        }
        else {
            res.status(400).json({ status: "failed", errors: [{ msg: 'Kanban not found' }] })
        }
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Server error')
    }
})

module.exports = router;