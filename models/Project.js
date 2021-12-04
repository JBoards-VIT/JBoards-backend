const mongoose = require('mongoose')
const uuid = require("uuid")

const ProjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    members: [{
        type: String,
    }],
    accessCode: {
        type: String,
        default: function genToken() {
            return uuid.v4()
        }
    },
    kanban: {
        type: String,
    }
})

module.exports = Project = mongoose.model('project', ProjectSchema)