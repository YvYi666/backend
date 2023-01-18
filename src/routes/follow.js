const express = require('express')
const router = express.Router()
const {authMiddleware}=require('../middleware/admin/auth.middleware')

const FollowController =require('../controller/follow')

router.post('/:username',authMiddleware,FollowController.follow)
router.delete('/:username',authMiddleware,FollowController.cancelFollow)
router.get('/:username',authMiddleware,FollowController.getFollowers)


module.exports = router