import express from 'express'
import { protectRoute } from '../middleware/protectRoute.js'

import { getUserProfile, getSuggestedUser, fowllowUnfollowUser, updateUser } from '../controller/user.controller.js'

let router = express.Router()

router.get('/profile/:username', protectRoute, getUserProfile)
router.get('/suggested', protectRoute, getSuggestedUser)
router.post('/follow/:id', protectRoute, fowllowUnfollowUser)
router.post('/update', protectRoute, updateUser)

export default router