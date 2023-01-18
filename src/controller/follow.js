const HttpException = require("../exceptions/http.exception");
const User = require("../models/user");

//添加关注
module.exports.follow = async (req, res, next) => {
    try {
        //获取参数：作者用户名
        const username = req.params.username
        //校验：作者
        //      1)参数校验 (后期补充)
        //      2）业务验证：作者用户是否存在
        const followedUser = await User.findOne({
            where: {
                username
            }
        })
        if (!followedUser) {
            throw new HttpException(404, '所关注用户不存在', 'user with this username not found')
        }
        //关注者信息（粉丝）
        //      1）获取email:通过token 
        const { email } = req.user
        //      2)获取粉丝信息
        const follower = await User.findByPk(email)
        //添加关注
        //      1）建立关系：被关注者主键和关注者主键存储到数据库中表followers
        followedUser.addFollowers(follower)
        //返回被关注者信息
        //基本信息和被关注状态
        const profile = {
            username: followedUser.username,
            bio: followedUser.bio,
            avatar: followedUser.avatar,
            following: true
        }
        res.status(200)
            .json({
                status: 1,
                message: '关注成功',
                data: profile,
            })
    } catch (error) {
        next(error)
    }
}
//取消关注
module.exports.cancelFollow = async (req, res, next) => {
    try {
        //获取参数：作者的用户名
        const username = req.params.username
        //校验：作者
        //      1）参数校验
        //      2）业务验证：作者用户是否存在
        const followedUser = await User.findOne({
            where: {
                username
            }
        })
        if (!followedUser) {
            throw new HttpException(404, '所取消关注用户不存在', 'user with this username not found')
        }
        //取消关注者信息（粉丝）
        //      1）获取email:通过token
        const { email } = req.user
        //      2）获取用户信息
        const follower = await User.findByPk(email)
        //取消关注
        //      1）建立关系：被关注者主键和关注者主键存储到数据库表中follow
        followedUser.removeFollowers(follower)
        //返回被关注者信息
        //      1）基本信息和被关注状态
        const profile = {
            username: followedUser.username,
            bio: followedUser.bio,
            avatar: followedUser.avatar,
            following: false
        }
        res.status(200)
            .json({
                status: 1,
                message: '取消关注成功',
                data: profile,
            })
    } catch (error) {
        next(error)
    }
}
//获取当前被查看的作者的信息&判断当前登入的用户是否关注
module.exports.getFollowers = async (req, res, next) => {
    try {
        //获取参数：作者的用户名 userAuthor
        const username = req.params.username
        //校验：提供被关注用户
        //      1）参数校验
        //      2）业务验证：
        //          *获取作者信息 ：连表查询 获取所有粉丝【emails】
        //          *作者信息是否纯在 
        const userAuthor = await User.findOne({
            where: {
                username
            },
            include:['followers']//通过followers中间表关联查询[user1,user2]
        })
        if (!userAuthor) {
            throw new HttpException(404, '用户不存在', 'user with this username not found')
        }
        //验证是否关注
        //      1）当前登入粉丝email:通过token
        //      2）是否关注：判断当前登入用户Email是否在作者的所有粉丝Email里面
        const { email } = req.user
        let following= false
        let followers =[]
        for(const user of userAuthor.followers){
            if(email===user.dataValues.email){
                following=true
            }
            delete user.dataValues.password
            delete user.dataValues.Follows
            followers.push(user.dataValues)
        }
        //返回被关注者信息
        //      1）基本信息
        //      2）关注状态
        //      3）粉丝信息
        const profile = {
            username: userAuthor.username,
            bio: userAuthor.bio,
            avatar: userAuthor.avatar,
            following,//是否关注
            followers,//所有粉丝
        }
        res.status(200)
            .json({
                status: 1,
                message: '获取关注信息成功',
                data: profile,
            })    } catch (error) {
        next(error)
    }
}