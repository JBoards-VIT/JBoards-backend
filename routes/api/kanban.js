const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')

const Project = require('../../models/Project')
const Kanban = require('../../models/Kanban')
const Card = require('../../models/Card')

router.get("/get-kanban/:projectId", auth, async (req, res) => {
    const { projectId } = req.params
    const result = {
        boards: [],
    }
    try {
        const project = await Project.findById(projectId)
        if (project) {
            result.name = project.name
            const kanban = await Kanban.findById(project.kanban)
            result.kanbanId = kanban._id.toString();
            if (kanban.boards.length > 0) {
                for (let i = 0; i < kanban.boards.length; i++) {
                    const board = kanban.boards[i];
                    const boardResult = { _id: board.id, name: board.name, cards: [] }
                    if (board.cards.length > 0) {
                        for (let j = 0; j < board.cards.length; j++) {
                            const card = await Card.findById(board.cards[j])
                            boardResult.cards.push(card)
                        }
                    }
                    result.boards.push(boardResult)
                }
            }
            res.status(200).json({ status: "success", result: result })
        }
        else {
            res.status(400).json({ status: "failed", message: 'Project not found' })
        }
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ status: "failed", "error": error.message })
    }
})

router.post("/board/create", auth, [
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
            res.status(400).json({ status: "failed", message: 'Kanban not found' })
        }
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ status: "failed", "error": error.message })
    }
})

router.post("/board/delete", auth, [
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
        const boardIndex = kanban.boards.findIndex((board) => board._id.toString() === boardId)
        if (kanban) {
            if (kanban.boards[boardIndex].cards.length > 0) {
                for (let i = 0; i < kanban.boards[boardIndex].cards.length; i++) {
                    let cardId = kanban.boards[boardIndex].cards[i];
                    Card.deleteOne({ id: cardId }, (err) => {
                        if (err) {
                            console.log(err)
                            res.status(500).json({ status: "failed", "error": error.message })
                        }
                    })
                }
            }
            kanban.boards.splice(boardIndex, 1)
            await kanban.save();
            res.status(200).json({ status: "success", message: "Successfully Deleted Board" })
        }
        else {
            res.status(400).json({ status: "failed", message: 'Kanban not found' })
        }
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ status: "failed", "error": error.message })
    }
})

router.post("/board/update", auth, [
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
            const boardIndex = kanban.boards.findIndex((board) => board._id.toString() === boardId)
            kanban.boards[boardIndex].name = name;
            await kanban.save();
            res.status(200).json({ status: "success", message: "Successfully Updated Board" })
        }
        else {
            res.status(400).json({ status: "failed", message: 'Kanban not found' })
        }
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ status: "failed", "error": error.message })
    }
});

router.post("/card/create", auth, [
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
            const boardIndex = kanban.boards.findIndex((board) => board._id.toString() === boardId)
            const card = new Card({
                title
            })
            await card.save()
            kanban.boards[boardIndex].cards.push(card._id)
            await kanban.save()
            res.status(201).json({ status: "success", message: "Successfully Added Card" })
        }
        else {
            res.status(400).json({ status: "failed", message: 'Kanban not found' })
        }
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ status: "failed", "error": error.message })
    }
})

router.post("/card/delete", auth, [
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
            const boardIndex = kanban.boards.findIndex((board) => board._id.toString() === boardId)
            const cardIndex = kanban.boards[boardIndex].cards.indexOf(cardId)
            if (cardIndex > -1) {
                kanban.boards[boardIndex].cards.splice(cardIndex, 1)
                await kanban.save()
                Card.deleteOne({ id: cardId }, (err) => {
                    if (err) {
                        console.log(err)
                        res.status(500).json({ status: "failed", "error": error.message })
                    }
                    else {
                        res.status(200).json({ status: "success", message: "Successfully Deleted Card" })
                    }
                })
            }
        }
        else {
            res.status(400).json({ status: "failed", message: 'Kanban not found' })
        }
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ status: "failed", "error": error.message })
    }
})

router.post("/card/move", auth, [
    check('sourceBoardId', 'Source Board Id is required').not().isEmpty(),
    check('targetBoardId', 'Target Board Id is required').not().isEmpty(),
    check('sourceCardIndex', 'Source Card Index is required').not().isEmpty(),
    check('targetCardIndex', 'Target Card Index is required').not().isEmpty(),
    check('kanbanId', 'Kanban Id is required').not().isEmpty(),
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { sourceBoardId, targetBoardId, sourceCardIndex, targetCardIndex, kanbanId } = req.body
    try {
        const kanban = await Kanban.findById(kanbanId)
        if (kanban) {
            const sourceBoardIndex = kanban.boards.findIndex((board) => board._id.toString() === sourceBoardId);
            const targetBoardIndex = kanban.boards.findIndex((board) => board._id.toString() === targetBoardId);
            const cardId = kanban.boards[sourceBoardIndex].cards[sourceCardIndex];
            if (cardId) {
                kanban.boards[sourceBoardIndex].cards.splice(sourceCardIndex, 1);
                console.log(kanban.boards[sourceBoardIndex].cards);
                kanban.boards[targetBoardIndex].cards.splice(targetCardIndex, 0, cardId);
                console.log(kanban.boards[targetBoardIndex].cards);
                await kanban.save();
                res.status(200).json({ status: "success", message: "Successfully Moved Card" });
            }
            else {
                res.status(400).json({ status: "failed", message: 'Card not found' });
            }
        }
        else {
            res.status(400).json({ status: "failed", message: 'Kanban not found' });
        }
    }
    catch (error) {
        console.error(error.message)
        res.status(500).json({ status: "failed", "error": error.message })
    }
});

router.post("/card/update/title", auth, [
    check('title', 'Card Title is required').not().isEmpty(),
    check('cardId', 'Card Id is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { title, cardId } = req.body
    try {
        const card = await Card.findById(cardId);
        if (card) {
            card.title = title;
            await card.save();
            res.status(200).json({ status: "success", message: "Successfully Updated Card Title" })
        }
        else {
            res.status(400).json({ status: "failed", message: 'Card not found' })
        }
    }
    catch (error) {
        console.error(error.message)
        res.status(500).json({ status: "failed", "error": error.message })
    }
})

router.post("/card/update/description", auth, [
    check('description', 'Card Description is required').not().isEmpty(),
    check('cardId', 'Card Id is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { description, cardId } = req.body
    try {
        const card = await Card.findById(cardId);
        if (card) {
            card.description = description;
            await card.save();
            res.status(200).json({ status: "success", message: "Successfully Updated Card Description" })
        }
        else {
            res.status(400).json({ status: "failed", message: 'Card not found' })
        }
    }
    catch (error) {
        console.error(error.message)
        res.status(500).json({ status: "failed", "error": error.message })
    }
})

router.post("/card/update/deadline", auth, [
    check('deadline', 'Deadline Date is required').isDate(),
    check('cardId', 'Card Id is required').not().isEmpty(),
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { deadline, cardId } = req.body
    try {
        const card = await Card.findById(cardId);
        if (card) {
            card.deadlineDate = new Date(deadline);
            await card.save();
            res.status(200).json({ status: "success", message: "Successfully Updated Card Deadline Date" })
        }
        else {
            res.status(400).json({ status: "failed", message: 'Card not found' })
        }
    }
    catch (error) {
        console.error(error.message)
        res.status(500).json({ status: "failed", "error": error.message })
    }
})

router.post("/card/labels/add", auth, [
    check('title', 'Label Title is required').not().isEmpty(),
    check('color', 'Label Color is required').not().isEmpty(),
    check('cardId', 'Card Id is required').not().isEmpty(),
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { title, color, cardId } = req.body
    try {
        const card = await Card.findById(cardId);
        if (card) {
            card.labels.push({
                title,
                color
            })
            await card.save();
            res.status(200).json({ status: "success", message: "Successfully Added Card Label" })
        }
        else {
            res.status(400).json({ status: "failed", message: 'Card not found' })
        }
    }
    catch (error) {
        console.error(error.message)
        res.status(500).json({ status: "failed", "error": error.message })
    }
})

router.post("/card/labels/delete", auth, [
    check('labelId', 'Label Id is required').not().isEmpty(),
    check('cardId', 'Card Id is required').not().isEmpty(),
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { labelId, cardId } = req.body
    try {
        const card = await Card.findById(cardId);
        if (card) {
            card.labels = card.labels.filter((label) => label._id.toString() !== labelId)
            await card.save();
            res.status(200).json({ status: "success", message: "Successfully Deleted Card Label" })
        }
        else {
            res.status(400).json({ status: "failed", message: 'Card not found' })
        }
    }
    catch (error) {
        console.error(error.message)
        res.status(500).json({ status: "failed", "error": error.message })
    }
})

router.post("/card/tasks/add", auth, [
    check('title', 'Task Title is required').not().isEmpty(),
    check('cardId', 'Card Id is required').not().isEmpty(),
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { title, cardId } = req.body
    try {
        const card = await Card.findById(cardId);
        if (card) {
            card.tasks.push({
                title,
            })
            await card.save();
            res.status(200).json({ status: "success", message: "Successfully Added Card Task" })
        }
        else {
            res.status(400).json({ status: "failed", message: 'Card not found' })
        }
    }
    catch (error) {
        console.error(error.message)
        res.status(500).json({ status: "failed", "error": error.message })
    }
})

router.post("/card/tasks/delete", auth, [
    check('taskId', 'Task Id is required').not().isEmpty(),
    check('cardId', 'Card Id is required').not().isEmpty(),
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { taskId, cardId } = req.body
    try {
        const card = await Card.findById(cardId);
        if (card) {
            card.tasks = card.tasks.filter((task) => task._id.toString() !== taskId)
            await card.save();
            res.status(200).json({ status: "success", message: "Successfully Deleted Card Task" })
        }
        else {
            res.status(400).json({ status: "failed", message: 'Card not found' })
        }
    }
    catch (error) {
        console.error(error.message)
        res.status(500).json({ status: "failed", "error": error.message })
    }
})

router.post("/card/tasks/toggle", auth, [
    check('taskId', 'Task Id is required').not().isEmpty(),
    check('cardId', 'Card Id is required').not().isEmpty(),
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { taskId, cardId } = req.body
    try {
        const card = await Card.findById(cardId);
        if (card) {
            const taskIndex = card.tasks.findIndex((task) => task._id.toString() === taskId)
            card.tasks[taskIndex].completed = !card.tasks[taskIndex].completed
            await card.save();
            res.status(200).json({ status: "success", message: "Successfully Toggled Card Task" })
        }
        else {
            res.status(400).json({ status: "failed", message: 'Card not found' })
        }
    }
    catch (error) {
        console.error(error.message)
        res.status(500).json({ status: "failed", "error": error.message })
    }
})

module.exports = router;