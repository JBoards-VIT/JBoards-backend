const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
    },
    registrationNumber: {
        type: String,
        unique: true,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
    }]
})

module.exports = User = mongoose.model('user', UserSchema)