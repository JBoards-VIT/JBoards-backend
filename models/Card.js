const mongoose = require('mongoose')
const uuid = require("uuid")

const CardSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: null,
    },
    deadlineDate: {
        type: Date,
        default: null,
    },
    labels: [{
        id: {
            type: String,
            default: function genUUID() {
                uuid.v4()
            }
        },
        title: {
            type: String,
            required: true,
        },
        color: {
            type: String,
            required: true,
        },
    }],
    tasks: [{
        id: {
            type: String,
            default: function genUUID() {
                uuid.v4()
            }
        },
        title: {
            type: String,
            required: true,
        },
    }]
})

module.exports = Card = mongoose.model('card', CardSchema)