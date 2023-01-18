const express = require('express')
const router = express.Router()
const {authMiddleware}=require('../middleware/admin/auth.middleware')

const ArticleController =require('../controller/articles')

router.post('/',authMiddleware,ArticleController.createArticle)//创建文章
router.get('/',ArticleController.getArticles)//条件获取全局文章
router.get('/follow',authMiddleware,ArticleController.getFollowArticle)//获取关注作者文章
router.get('/:slug',authMiddleware,ArticleController.getArticle)//获取单个文章
router.put('/:slug',authMiddleware,ArticleController.updateArticle)//更新文章
router.delete('/:slug',authMiddleware,ArticleController.deleteArticle)//删除文章



module.exports = router