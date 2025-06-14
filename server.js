const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const connectDB = require('./config/db')
const errorHandler = require('./middleware/error')

// Routes
const todosRoutes = require('./routes/todos')
const authRoutes = require('./routes/auth')
const invitationRoutes = require('./routes/invite')

dotenv.config({ path: './config/config.env' })

connectDB()

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(fileUpload())
app.use(morgan('dev'))

app.use('/api/v1/todos', todosRoutes)
app.use('/api/v1/auth', authRoutes)

app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.bgGreen
  )
})
