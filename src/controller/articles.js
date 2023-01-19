const sequelize = require("../db/sequelize")
const HttpException = require("../exceptions/http.exception")
const Article = require("../models/article")
const Tag = require("../models/tag")
const User = require("../models/user")
const { getSlug } = require("../utils/slug")
const { validateCreateArticle } = require("../utils/validate/article.calidate")

//优化返回标签抽离
function handleArticle(article, author) {
    const newTags = []
    for (const t of article.dataValues.tags) {
        newTags.push(t.name)
    }
    article.dataValues.tags = newTags

    delete author.dataValues.password
    delete author.dataValues.email
    article.dataValues.author = author

    return article.dataValues
}
//优化返回标签抽离(多个)
const handleArticles = async (currentEmail, article) => {
    //处理标签
    const newTags = []
    for (const t of article.dataValues.tags) {
        newTags.push(t.name)
    }
    article.dataValues.tags = newTags
    //处理作者信息
    let { username, email, bio, avatar } = article.dataValues.user
    let author = {
        username,
        email,
        bio,
        avatar
    }
    delete article.dataValues.user
    article.dataValues.aurhor = author
    //喜欢文章
    const favoritCount = await article.countUsers()
    if (favoritCount === 0) {
        article.dataValues.isFavorite = false
        article.dataValues.favoritCounter = 0
        return article.dataValues
    }
    //未登入游客
    if(currentEmail){
        article.dataValues.isFavorite = false
        article.dataValues.favoritCounter = favoritCount
        return article.dataValues
    }
        
        //当前登入用户是否已经喜欢
        //获取喜欢文章的人数
        //获取喜欢文章人的emails
        //当前登入用户是否在喜欢文章人中
    
        const allFavoriteUsers = await article.getUsers()
        let allFavoriteUsersEmails = []
        allFavoriteUsers.forEach(user => {
            allFavoriteUsersEmails.push(user.email)
        })
        let isFavorite = allFavoriteUsersEmails.includes(currentEmail)
        article.dataValues.isFavorite = isFavorite
        article.dataValues.favoritCounter = favoritCount
        return article.dataValues
    
}

//创建文章
module.exports.createArticle = async (req, res, next) => {
    try {
        //获取请求内容： title description body tags
        const { title, description, body, tags } = req.body.article
        //请求内容验证：字段验证
        let { error, validate } = validateCreateArticle(title, description, body, tags)
        if (!validate) {
            throw new HttpException(401, '文章创建参数验证失败', error)
        }
        //获取作者信息：token 解签 => email=>author信息 （只有登入用户的作者才能编辑自己的文章）
        const { email } = req.user
        const author = await User.findByPk(email)
        if (!author) {
            throw new HttpException(401, '作者账号不存在', 'author user not found')
        }
        //创建文章
        //  1）生成别名
        let slug = getSlug()
        //  2）存储数据：文章和作者email
        let article = await Article.create({//注意：这儿创建返回值是不包含标签关系的
            slug,
            title,
            description,
            body,
            userEmail: author.email
        })
        //创建文章和标签的关系
        //  1）两种标签1.系统自带标签（数据库已经存在）=>文章和标签关系存储
        //  2）       2.自定义标签（作者自己添加的标签）=>文章和标签关系存储
        //              2.1）标签存储
        //              2.2）文章和标签的关联
        if (tags) {
            for (const t of tags) {
                let existTag = await Tag.findByPk(t)
                let newTag
                if (!existTag) {
                    //存储用户自定义标签
                    newTag = await Tag.create({ name: t })
                    //文章和标签的关联 :taglist
                    await article.addTag(newTag)
                } else {
                    //文章和标签的关联 :taglist
                    await article.addTag(existTag)
                }
            }
        }
        //返回文章数据（文章/标签/作者）
        //  1）根据slug获取数据（包含文章对应的标签）
        article = await Article.findByPk(slug, { include: Tag })
        //  2)标签返回优化
        //      作者信息优化
        article = handleArticle(article, author)
        //      文章数据优化返回
        res.status(201)
            .json({
                status: 1,
                message: '文章创建成功',
                data: article
            })
    } catch (error) {
        next(error)
    }
}

//获取文章：单个文章
module.exports.getArticle = async (req, res, next) => {
    try {
        // 获取参数：slug
        const { slug } = req.params
        // 获取文章：根据slug及关联的标签
        let article = await Article.findByPk(slug, { include: Tag })
        // 获取当前文章的作者:userEmail
        // console.log(article.__proto__)//getUser
        const author = await article.getUser()
        // 返回数据处理：标签和作者信息
        article = handleArticle(article, author)
        // 响应数据
        res.status(200)
            .json({
                status: 1,
                message: '获取一篇文章成功',
                data: article
            })
    } catch (error) {
        next(error)
    }
}

//获取文章：关注作者的文章
module.exports.getFollowArticle = async (req, res, next) => {
    try {
        //获取登入：用户email
        const fansEmail = req.user.email
        //通过用户去找到关注作者的email:follows 关联表
        const query = `SELECT userEmail FROM follows WHERE followerEmail="${fansEmail}"`
        const followAuthors = await sequelize.query(query)
        //      1)如果没有关注的作者就没有关注文章 =>[]
        if (followAuthors[0].length == 0) {
            return res.status(200).json({
                status: 1,
                message: "还没有关注的博主哦！",
                data: []
            })
        }
        //      2)有获取作者Email：[author1,autor2]
        let followAuthorEmails = []
        for (const o of followAuthors[0]) {
            followAuthorEmails.push(o.userEmail)
        }
        //获取作者文章
        //      1）遍历获取作者[author1,autr2]
        //      2）获取作者所有文章（注意标签信息和作者信息）
        let { count, rows } = await Article.findAndCountAll({
            distinct: true,//去重count和rows可能不一样去重后一致
            where: {
                userEmail: followAuthorEmails //查询了一个数组
            },
            include: [Tag, User]
        })
        //每一个作者的每一个文章处理：标签和作者信息
        let articles = []
        for (let t of rows) {
            let handleArticle = await handleArticles(fansEmail,t)
            articles.push(handleArticle)
        }
        //响应信息
        res.status(200)
            .json({
                status: 1,
                message: '作者文章查询成功',
                data: { articles, articlesCount: count }
            })
    } catch (error) {
        next(error)
    }
}

//获取文章：条件（tag,author,limit(限制条数),offset）获取全局文章
//通过 标签~作者 获取文章    //限制 偏移量
module.exports.getArticles = async (req, res, next) => {
    try {
        const email =req.user?req.user.email:null
        //获取条件查询参数 ：query > tag atuhor limit offset
        const { tag, author, limit = 10, offset = 0 } = req.query
        //获取文章数组:
        let result 
        if (tag && !author) { //有标签没作者 +分页数据
            result = await Article.findAndCountAll({
                distinct: true,
                include: [{
                    model: Tag,
                    attributes: ['name'],
                    where: { name: tag }
                }, {
                    model: User,
                    attributes: ['email', 'username', 'bio', 'avatar']
                }],
                limit: parseInt(limit),
                offset: parseInt(offset)
            })
        } else if (!tag && author) {//有作者没标签 +分页数据
            result = await Article.findAndCountAll({
                distinct: true,
                include: [{
                    model: Tag,
                    attributes: ['name'],
                }, {
                    model: User,
                    attributes: ['email', 'username', 'bio', 'avatar'],
                    where: { username: author }
                }],
                limit: parseInt(limit),
                offset: parseInt(offset)
            })
        } else if (tag && author) {//有标签和作者 +分页数据
            result = await Article.findAndCountAll({
                distinct: true,
                include: [{
                    model: Tag,
                    attributes: ['name'],
                    where: { name: tag }
                }, {
                    model: User,
                    attributes: ['email', 'username', 'bio', 'avatar'],
                    where: { username: author }
                }],
                limit: parseInt(limit),
                offset: parseInt(offset)
            })
        } else {//没作者没标签
            result = await Article.findAndCountAll({
                distinct: true,
                include: [{
                    model: Tag,
                    attributes: ['name'],
                }, {
                    model: User,
                    attributes: ['email', 'username', 'bio', 'avatar'],
                }],
                limit: parseInt(limit),
                offset: parseInt(offset)
            })
        }
        const {count,rows}=result

        //文章数据处理
        //      遍历文章并处理作者于标签信息
        let articles = []
        for (const t of rows) {
            let handleArticle=await handleArticles(email,t)
            articles.push(handleArticle)
        }
        //响应数据
        res.status(200)
            .json({
                status: 1,
                message: '条件查询文章成功',
                data: {articles,articlesCount:count}
            })
    } catch (error) {
        next(error)
    }
}

//获取文章：更新文章
module.exports.updateArticle = async (req, res, next) => {
    try {
        //中间件登入验证
        //获取参数：slug(params)
        const { slug } = req.params
        //获取更新内容:body
        let { title, description, body } = req.body.article
        //获取更新文章：根据slug获取需要更新的文章包括标签
        let article = await Article.findByPk(slug, { include: Tag })
        //修改文章权限验证：只有当前登入用户为作者才可编辑更新
        const loginUser = await User.findByPk(req.user.email)
        if (!loginUser) {
            throw new HttpException(401, '当前登入用户不存在', 'user not found')
        }
        const authorEmail = article.userEmail
        if (loginUser.email !== authorEmail) {
            throw new HttpException(403, '作者才能编辑', 'only author have permission to update current article')
        }
        //修改字段验证
        title = title ? title : article.title
        description = description ? description : article.description
        body = body ? body : article.body
        //更新数据操作
        const updateArticle = await article.update({ title, description, body })
        //返回数据处理：标签和作者信息
        article = handleArticle(updateArticle, loginUser)
        //响应数据
        res.status(201)
            .json({
                status: 1,
                message: '文章更新成功',
                data: article
            })
    } catch (error) {
        next(error)
    }
}
//删除文章
module.exports.deleteArticle = async (req, res, next) => {
    try {
        // 获取参数：slug
        const { slug } = req.params
        // 获取文章：根据slug及关联的标签
        //     1）文章不存在直接抛出异常
        let article = await Article.findByPk(slug, { include: Tag })
        if (!article) {
            throw new HttpException(404, '当前文章不存在', 'articleon not foud')
        }
        // 获取当前登入用户：是否为作者
        //     1）是可以删除
        //     2）否抛出异常
        const { email } = req.user
        const loginUser = await User.findByPk(email)
        if (!loginUser) {
            throw new HttpException(401, '当前登入用户不存在', 'user not found')
        }
        const authorEmail = article.userEmail
        if (email !== authorEmail) {
            throw new HttpException(403, '作者才能编辑', 'only author have permission to update current article')

        }
        //删除文章：依据slug删除数据库中的文章
        await Article.destroy({ where: { slug } })
        // 响应数据
        res.status(200)
            .json({
                status: 1,
                message: '文章删除成功',
            })
    } catch (error) {
        next(error)
    }
} 