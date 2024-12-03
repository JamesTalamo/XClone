import User from "../model/user.model.js"
import Post from '../model/post.model.js'
import Notification from "../model/notification.model.js"

import { v2 as cloudinary } from 'cloudinary'

export const getAllPost = async (req, res) => {
    try {
        let allPost = await Post.find().sort({ createdAt: -1 }).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        })

        if (allPost.length === 0) return res.status(200).json([])

        return res.status(200).json(allPost)
    } catch (error) {
        console.log(error)
        return res.status(400).json({ error: "Internal Server Error." })
    }
}

export const getFollowingPost = async (req, res) => {
    try {
        const userId = req.user._id

        let user = await User.findById(userId)
        if (!user) return res.status(400).json({ error: "User Not Found." })

        let following = user.following

        const feedPost = await Post.find({ user: { $in: following } }).sort({ createdAt: -1 }).
            populate({
                path: "user",
                select: "-password"
            }).
            populate({
                path: "comments.user",
                select: "-password"
            })

        return res.status(200).json(feedPost)

    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: "Internal Server Error." })
    }
}

export const getLikedPost = async (req, res) => {
    try {
        const userId = req.params.id

        const user = await User.findById(userId)
        if (!user) return res.status(400).json({ error: "User Not Found." })

        const likedPost = await Post.find({ _id: { $in: user.likedPost } })
            .populate({
                path: "user",
                select: "-password"
            }).populate({
                path: "comments.user",
                select: "-password"
            })
        res.status(200).json(likedPost)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Internal Server Error." })
    }
}

export const getUserPost = async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ error: "User not found" });

        const posts = await Post.find({ user: user._id })
            .sort({ createdAt: -1 })
            .populate({
                path: "user",
                select: "-password",
            })
            .populate({
                path: "comments.user",
                select: "-password",
            });

        res.status(200).json(posts);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Internal Server Error." })
    }
}

export const createPost = async (req, res) => {
    try {
        let { text, img } = req.body
        const userId = req.user._id.toString()

        const user = await User.findById(userId).select("-password")
        if (!user) return res.status(400).json({ error: "User Does Not Exist." })

        if (!text && img) return res.status(400).json({ error: "Text Or Image Is Required." })

        if (img) {
            const uploadedResponse = await cloudinary.uploader.upload(img)
            img = uploadedResponse.secure_url
        }

        const newPost = new Post({
            user: userId,
            text: text,
            img: img
        })

        await newPost.save()
        res.status(201).json(newPost)

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Internal Server Error." })
    }
}

export const likeUnlikePost = async (req, res) => {
    try {
        let userId = req.user._id
        let { id: postId } = req.params

        let post = await Post.findById(postId)
        if (!post) return res.status(400).json({ error: "Post Not Found." })

        let userLikedPost = post.likes.includes(userId)

        if (userLikedPost) {
            //unlike post
            await Post.updateOne({ _id: postId }, { $pull: { likes: userId } })
            await User.updateOne({ _id: userId }, { $pull: { likedPost: postId } })

            const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString())

            return res.status(200).json(updatedLikes)
        } else {
            //like post
            post.likes.push(userId)
            await User.updateOne({ _id: userId }, { $push: { likedPost: postId } })
            await post.save()

            let notification = new Notification({
                from: userId,
                to: post.user,
                type: "like"
            })
            await notification.save()

            const updatedLikes = post.likes
            return res.status(200).json(updatedLikes)
        }
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: "Internal Server Errror." })
    }
}

export const commentOnPost = async (req, res) => {
    try {
        let { text } = req.body
        let postId = req.params.id
        let userId = req.user._id.toString()

        if (!text) return res.status(400).json({ error: "Text Is Required." })

        const post = await Post.findById(postId)
        if (!post) return res.status(400).json({ error: "Post Does Not Exist." })

        const comment = { user: userId, text: text }

        post.comments.push(comment)

        await post.save()

        res.status(200).json(post)

    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: "Internal Server Error." })
    }
}

export const deletePost = async (req, res) => {
    try {
        let { id } = req.params

        let postExist = await Post.findById(id)
        if (!postExist) return res.status(400).json({ error: "Post Does Not Exist." })

        if (postExist.user.toString() !== req.user._id.toString()) return res.status(400).json({ error: "You Are Not Authorized To Deleted This Post." })

        if (postExist.img) {
            const imgId = postExist.img.split('/').pop().split('.')[0]
            await cloudinary.uploader.destroy(imgId)
        }

        await Post.findByIdAndDelete(id)
        res.status(200).json({ message: "Post Successfully Deleted." })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Internal Server Error." })
    }
}