import mongoose from "mongoose";

export const connectDb = async () => {
    try {
        mongoose.connect(process.env.MONGO_KEY)
        console.log('Connected to mongodb')
    } catch (error) {
        console.error(error.message)
    }
}