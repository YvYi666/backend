const HttpException = require("../exceptions/http.exception")
const Article = require("../models/article")
const Comment = require("../models/comment")
const User = require("../models/user")

//创建评论
module.exports.createComment = async(req,res,next)=>{
    try{
        //获取参数：文章slug
        const {slug}=req.params
        //获取参数：评论内容
        const {body}=req.body.comment
        //接口参数验证
        //获取文章并校验
        //      1）校验：是否存在
        const article = await Article.findByPk(slug)
        if(!article){
            throw new HttpException(404,'评论文章不存在','comment not found')
        }
        //获取评论用户
        //      1）校验：是否存在
        const user= await User.findByPk(req.user.email)
        if(!user){
            throw new HttpException(404,'用户不存在','user not found')
        }       
        //创建评论：存储评论内容（中间表）
        let newComment =await Comment .create({body})
        //创建关系：
        //      1)登入用户和评论的关系：存储
        await user.addComments(newComment)
        //      2）评论和文章的关系：存储
        await article.addComments(newComment)
        //优化返回信息：评论里追加 评论人和文章信息
        newComment.dataValues.user ={
            username:user.dataValues.username,
            bio:user.dataValues.bio,
            avatar:user.dataValues.avatar,
        }
        //响应数据
        res.status(201)
            .json({
                status: 1,
                message: '创建评论成功',
                data:newComment
            })
    }catch(error){
        next(error)
    }
}
//获取评论
module.exports.getComments = async(req,res,next)=>{
    try{
        //获取参数：文章slug
        const {slug}=req.params
        //获取文章：校验是否存在
        const article =await Article.findByPk(slug)
        if(!article){
            throw new HttpException(404,'评论文章不存在','comment not found')
        }
        //获取文章评论
        //      1)条件查询：articleSlug =slug
        //      2）包含评论人信息：
        const comments =await Comment.findAll({
            where:{
                articleSlug:slug
            },
            include:[{
                model:User,
                attributes:['username','bio','avatar']
            }]
        })
        res.status(200)
            .json({
                status: 1,
                message: '获取评论列表成功',
                data:comments
            })
        //响应信息
    }catch(error){
        next(error)
    }
}
//删除评论
module.exports.deleteComment = async(req,res,next)=>{
    try{
        //获取参数：
        //      1）文章：slug
        //      1）评论：id
        const {slug,id}=req.params
        //获取文章：校验
        const article =await Article.findByPk(slug)
        if(!article){
            throw new HttpException(404,'评论文章不存在','comment are articles not found')
        }
        //获取评论：校验
        const comment =await Comment.findByPk(id)
        if(!comment){
            throw new HttpException(404,'评论不存在','comment not found')
        }
        //业务验证
        //      1）当前登入用户 是否是当前准备删除评论的人
        if(req.user.email!==comment.userEmail){
            throw new HttpException(404,'评论的用户才能删除','comment is user can delete')
        }
        //      2）文章作者可以删除
        //删除操作  
        await Comment.destroy({where:{id}})
        //响应数据
        res.status(200)
            .json({
                status: 1,
                message: '删除评论成功',
            })
    }catch(error){
        next(error)
    }
}