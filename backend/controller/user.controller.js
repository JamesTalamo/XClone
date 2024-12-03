import bcrypt from 'bcryptjs'
import User from "../model/user.model.js"
import Notification from "../model/notification.model.js"

import { v2 as cloudinary } from 'cloudinary'


export const getUserProfile = async (req, res) => {
    const { username } = req.params

    try {
        const user = await User.findOne({ username }).select("-password")
        if (!user) return res.status(404).json({ error: "User Not Found." })


        res.status(200).json(user)
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: "Internal Server Error." })
    }
}

export const getSuggestedUser = async (req, res) => {
    try {
        const userId = req.user._id

        const usersFollowedByMe = await User.findById(userId).select("following")

        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userId }
                }
            },
            { $sample: { size: 10 } }
        ])

        const filteredUsers = users.filter(user => !usersFollowedByMe.following.includes(user._id))

        const suggestedUsers = filteredUsers.slice(0, 4)

        suggestedUsers.forEach((user) => {
            user.password = null
        })

        res.status(200).json(suggestedUsers)
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: "Internal Server Error." })
    }
}

export const fowllowUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params

        const userToModify = await User.findById(id)
        const currentUser = await User.findById(req.user._id)

        if (id === req.user._id.toString()) {
            return res.status(400).json({ error: "You Can't Follow/Unfollow Yourself." })
        }

        if (!userToModify || !currentUser) return res.status(400).json({ error: "User Not Found." })

        const isFollowing = currentUser.following.includes(id)
        if (isFollowing) {
            //Unfollow the user
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } }) // followers of ID
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } }) // following of ID

            return res.status(200).json({ message: "User Unfollowed Successfully." })
        } else {
            //Follow
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } }) // followers of ID
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } }) // following of ID
            //send notification
            const newNotification = await Notification({
                type: 'follow',
                from: req.user._id,
                to: userToModify._id,
            })

            await newNotification.save()

            //TODO return the id of the user as a response
            return res.status(200).json({ message: "User Followed Successfully." })


        }


    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: "Internal Server Error." })
    }
}

export const updateUser = async (req, res) => {

    const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body
    let { profileImg, coverImg } = req.body

    const userId = req.user._id // get the current Id of the current user
    try {
        let user = await User.findById(userId)
        if (!user) return res.status(404).json({ error: "User Not Found." })

        if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
            return res.status(400).json({ error: "Please Provide Both Current And New Password." })
        }

        if (currentPassword && newPassword) {
            //For Password
            const isMatch = await bcrypt.compare(currentPassword, user.password)
            if (!isMatch) return res.status(400).json({ error: "Password Is Not Correct." })

            if (newPassword.length < 6) return res.status(400).json({ error: "Password Must Be Atleast 6 Characters." })
            ////Hash the new password
            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(newPassword, salt)
        }

        ////Upload image in cloudinary and send the url in the their objects variables.
        if (profileImg) {
            if (user.profileImg) {
                await cloudinary.uploader.destroy(user.profileImg.split('/').pop().split(".")[0])
            }

            const uploadedResponse = await cloudinary.uploader.upload(profileImg)
            profileImg = uploadedResponse.secure_url
        }

        if (coverImg) {
            if (user.coverImg) {
                await cloudinary.uploader.destroy(user.profileImg.split('/').pop().split(".")[0])
            }

            const uploadedResponse = await cloudinary.uploader.upload(coverImg)
            coverImg = uploadedResponse.secure_url
        }

        user.fullName = fullName || user.fullName
        user.username = username || user.username
        user.email = email || user.email
        user.bio = bio || user.bio
        user.link = link || user.link
        user.profileImg = profileImg || user.profileImg
        user.coverImg = coverImg || user.coverImg

        user = await user.save()

        user.password = null // password should be null at response.

        return res.status(200).json(user)

    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: "Internal Server Error." })
    }
}