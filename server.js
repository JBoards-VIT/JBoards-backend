const express = require('express')
const cors = require("cors")
const connectDB = require('./config/db')

const app = express()

connectDB()
app.use(express.json({ extended: false }))
app.use(cors())
app.get('/', (req, res) => res.send('API Running!!'))

app.use('/api/users', require('./routes/api/users'))
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/project', require('./routes/api/project'))
app.use('/api/kanban', require('./routes/api/kanban'))


const PORT = process.env.PORT || 4999

app.listen(PORT, () => console.log(`Server started on ${PORT}`))