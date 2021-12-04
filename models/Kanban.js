const mongoose = require('mongoose')
const uuid = require("uuid")
const KanbanSchema = new mongoose.Schema({
    boards: [{
        name: {
            type: String,
            required: true,
        },
        cards: [{
            type: String,
            ref: "Card",
        }]
    }]
})

module.exports = Kanban = mongoose.model('kanban', KanbanSchema)