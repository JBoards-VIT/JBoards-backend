const mongoose = require('mongoose')
const uuid = require("uuid")
const KanbanSchema = new mongoose.Schema({
    boards: [{
        id: {
            type: String,
            default: function genUUID() {
                uuid.v4()
            }
        },
        name: {
            type: String,
            required: true,
        },
        cards: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Card",
        }]
    }]
})

module.exports = Kanban = mongoose.model('kanban', KanbanSchema)