const mongoose = require('mongoose')
const config = require('config')

const db = config.get('mongoTestURI')

const connectDB = async () => {
    try {
        await mongoose.connect(db)
        console.log('MongoDB Connection Established Successfully')
    } catch (err) {
        console.log('MongoDB Connection Failed')
        console.log(err.message)
        process.exit(1)
    }
}

module.exports = connectDB