import cors from 'cors'

import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import { v2 as cloudinary } from 'cloudinary'

import { connectDb } from './config/connectDb.js'
import express from 'express'

import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import postRoutes from './routes/post.routes.js'
import notificationRoute from './routes/notification.routes.js'

const app = express()

dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUDNAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})


const allowedOrigins = process.env.ALLOWED_ORIGIN.split(',').map((origin) => origin.trim())
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}))


app.use(express.json({ limit: "5mb" })) // so can parse body in request // limit should not be too large to prevent DOS 
app.use(express.urlencoded({ extended: true })) // so i can use form easy
app.use(cookieParser()) // to use cookies

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/post', postRoutes)
app.use('/api/notification', notificationRoute)

app.use(express.static('./backend/public'))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    connectDb()
    console.log(`Connected to PORT ${PORT}`)
})