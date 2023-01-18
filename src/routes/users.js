const express = require('express')
const router = express.Router()
const {authMiddleware}=require('../middleware/admin/auth.middleware')

const UserController =require('../controller/users')

router.post('/',UserController.createUser)
router.post('/login',UserController.login)
router.get('/',authMiddleware,UserController.getUser)
router.patch('/',authMiddleware,UserController.updateUser) //局部跟新

module.exports = router