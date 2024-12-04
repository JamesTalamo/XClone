import User from "../model/user.model.js"
import bcrypt from 'bcryptjs'
import { generateTokenAndSetCookie } from '../lib/utils/generateToken.js'

export const signup = async (req, res) => {
    try {
        const { username, fullName, email, password } = req.body

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid Email Format." })
        }

        const existingUser = await User.findOne({ username })
        if (existingUser) {
            return res.status(400).json({ error: "Username Is Already Taken." })
        }

        const exisingEmail = await User.findOne({ email })
        if (exisingEmail) {
            return res.status(400).json({ error: "Email Is Already Taken." })
        }

        if (password.length < 6) {
            return res.status(400).json({ error: "Password Must Be 6 Characters Long." })
        }
        //hashing the password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
            fullName: fullName,
            username: username,
            email: email,
            password: hashedPassword
        })



        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res)
            await newUser.save()

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                username: newUser.username,
                email: newUser.email,
                password: newUser.password,
                followers: newUser.followers,
                following: newUser.following,
                profileImg: newUser.profileImg,
                coverImg: newUser.coverImg
            })
        } else {
            return res.status(400).json({ error: "Invalid User Data." })
        }


    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: 'Internal Server Error.' })
    }
}

export const login = async (req, res) => {
    try {
        const { username, password } = req.body

        const user = await User.findOne({ username })
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "") // so no error even if empty string pass

        if (!user || !isPasswordCorrect) {
            return res.status(400).json({ error: "Inputs are Incorrect." })
        }

        generateTokenAndSetCookie(user._id, res)

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            password: user.password,
            followers: user.followers,
            following: user.following,
            profileImg: user.profileImg,
            coverImg: user.coverImg
        })

    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: 'Internal Server Error.' })
    }


}

export const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", {
            maxAge: 0, // Expire the cookie immediately
            path: '/', // Cookie valid for the entire domain (root of the domain)
            httpOnly: true, // Prevents JS from accessing the cookie
            secure: true,
            sameSite: 'None', // 
        });

        res.status(200).json({ message: "Successfully Logout." })

    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: "Internal Server Error." })
    }
}

export const getMe = async (req, res) => {
    try {
        let user = await User.findById(req.user._id).select("-password")

        res.status(200).json(user)
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: "Internal Server Error." })
    }
}