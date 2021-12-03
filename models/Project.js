const mongoose = require('mongoose')
const uuid = require("uuid")

const ProjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    accessCode: {
        type: String,
        default: function genToken() {
            uuid.v4()
        }
    },
    kanban: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Kanban",
    }
})

module.exports = Project = mongoose.model('project', ProjectSchema)