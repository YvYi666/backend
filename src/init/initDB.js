const dbConnection = require('../db/connection')
const sequelize = require('../db/sequelize')
const User = require('../models/user')
const Article = require('../models/article')
const Tag = require('../models/tag')
const Comment = require('../models/comment')

//模型关系:a b
//a.hasOne(b)     a有一个b
//a.belongsTO(b)  a属于b
//a.hasMany(b)    a有多个b
//a.belongsToMany(b,{through:'c'}) a属于b，通过联结表c

const initRelation = () => {
    // User (源)- User(目标模型) ：
    User.belongsToMany(User, {
        through: 'Follows',//通过源和目标模型，自动创建的模型（中间表）
        as: 'followers',//目标模型别名
        timestamps: false,
    })

    //用户和文章属于：一对多
    User.hasMany(Article, {
        onDelete: 'CASCADE'
    })
    Article.belongsTo(User) //将Article模型上面添加一个字段UserEmail（user模型的主键）=>作用文章属于哪个用户的


    //用户 - 文章 （喜欢）：多对多
    User.belongsToMany(Article, {
        through: 'Favorites',
        timestamps: false,
    })
    Article.belongsToMany(User, {
        through: 'Favorites',
        timestamps: false,
    })


    //用户和评论：（一对多）
    User.hasMany(Comment, {
        onDelete: 'CASCADE'
    })
    Comment.belongsTo(User)

    //文章和评论（一对多）
    Article.hasMany(Comment,{
        onDelete:'CASCADE'})
    Comment.belongsTo(Article)

    //文章和标签:多对多
    Article.belongsToMany(Tag, {
        through: 'TagList',
        uniqueKey: false,
        timestamps: false,
    })
    Tag.belongsToMany(Article, {
        through: 'TagList',
        uniqueKey: false,
        timestamps: false,
    })
}

const initDB = () => {
    return new Promise(async (resolve, reject) => {
        try {
            //数据库连接
            await dbConnection()

            //初始化model关系
            initRelation()

            //同步所有模型和关系
            await sequelize.sync({ alter: true })

            //其他操作
            resolve()
        } catch (error) {
            console.log(error);
            reject(error)
        }
    })
}
module.exports = initDB