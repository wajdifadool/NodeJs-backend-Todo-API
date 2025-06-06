// app.js
const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const connectDB = require('./config/db')
const errorHandler = require('./middleware/errorHandler')

// Routes
const todosRoutes = require('./routes/todos')
const authRoutes = require('./routes/auth')

dotenv.config({ path: './config/config.env' })

// connectDB()

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(fileUpload())
app.use(morgan('dev'))

app.use('/api/v1/todos', todosRoutes)
app.use('/api/v1/auth', authRoutes)

app.use(errorHandler)

module.exports = app
