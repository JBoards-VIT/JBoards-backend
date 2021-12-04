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
        title: {
            type: String,
            required: true,
        },
        completed: {
            type: Boolean,
            default: false,
        }
    }]
})

module.exports = Card = mongoose.model('card', CardSchema)