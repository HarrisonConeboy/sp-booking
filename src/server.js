// Import dependencies
const express = require('express')
const cors = require('cors')
require('dotenv').config()

// Routers
const apiRouter = require('./routes/api.route')

// Create the app and default port to 5000
const app = express()
const port = 5000

// Use middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: false}))

// Apply router middleware
app.use('/api', apiRouter)

// Initialize server on our port
app.listen(port, () => {
        console.log(`Server listening on port ${port}`)
    }
)
