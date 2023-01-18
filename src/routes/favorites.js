const express = require('express')
const router = express.Router()
const {authMiddleware}=require('../middleware/admin/auth.middleware')

const FavoriteController =require('../controller/favorites')

router.post('/:slug',authMiddleware,FavoriteController.addFavorite)//喜欢文章
router.delete('/:slug',authMiddleware,FavoriteController.removeFavorite)//删除喜欢文章



module.exports = router