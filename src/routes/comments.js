const express = require('express')
const router = express.Router()
const {authMiddleware}=require('../middleware/admin/auth.middleware')

const CommentController =require('../controller/comments')

router.post('/:slug/comment',authMiddleware,CommentController.createComment)//创建评论
router.get('/:slug/comments',authMiddleware,CommentController.getComments)//获取评论lits
router.delete('/:slug/comment/:id',authMiddleware,CommentController.deleteComment)//删除评论



module.exports = router