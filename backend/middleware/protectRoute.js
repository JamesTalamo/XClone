import User from '../model/user.model.js'
import jwt from 'jsonwebtoken'


export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt
        if (!token) return res.status(400).json({ error: "Unauthrozied, No Token Provided" })

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (!decoded) return res.status(400).json({ error: "Invalid Token" })

        let user = await User.findById(decoded.userId).select("-password")
    
        req.user = user

        next()
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: "Internal Server Error." })
    }
}