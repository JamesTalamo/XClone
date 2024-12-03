import express from 'express'
import { protectRoute } from '../middleware/protectRoute.js'
import { getAllPost, getFollowingPost, getLikedPost, getUserPost, createPost, likeUnlikePost, commentOnPost, deletePost } from '../controller/post.controller.js'
const router = express.Router()

router.get('/all', protectRoute, getAllPost)
router.get('/following', protectRoute, getFollowingPost)
router.get('/likes/:id', protectRoute, getLikedPost)
router.get('/user/:username', protectRoute, getUserPost)
router.post('/create', protectRoute, createPost)
router.post('/like/:id', protectRoute, likeUnlikePost)
router.post('/comment/:id', protectRoute, commentOnPost)
router.delete('/:id', protectRoute, deletePost)

export default router 