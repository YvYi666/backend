const express = require('express')
const router = express.Router()
//中间件
const TagController =require('../controller/tags')
const {authMiddleware}=require('../middleware/admin/auth.middleware')


router.get('/',TagController.getTags)
router.post('/',authMiddleware,TagController.createTag)


module.exports = router