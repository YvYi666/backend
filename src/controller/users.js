const { validateCreateUser, validateUserLogin } = require('../utils/validate/user.validate')
const HttpException = require('../exceptions/http.exception')
const User = require('../models/user')
const { md5Password, matchPassword } = require('../utils/md5')
const { sign } = require('../utils/jwt')


//用户注册
module.exports.createUser = async (req, res, next) => {
    try {
        //获取提交内容
        let { username, password, email } = req.body.user
        //数据验证
        let { error, validate } = validateCreateUser(username, password, email)
        if (!validate) {
            throw new HttpException(401, '用户提交数据验证失败', error)
        }
        //业务验证
        //1）验证email是否存在
        const existUser = await User.findByPk(email)
        if (existUser) {
            throw new HttpException(401, '用户注册邮箱已存在', 'email is exist')
        }
        //用户创建
        //1）密码加密
        const md5PWD = await md5Password(password)
        //2）User model 存储数据库
        const user = await User.create({
            username,
            password: md5PWD,
            email
        })
        //3）创建成功：返回
        if (user) {
            // console.log(user);
            //3.1）创建token
            let data = {}
            data.username = username
            data.email = email
            data.token = await sign(username, email)
            data.bio = null
            data.avatar = null
            //3.2）返回数据
            res.status(201)//创建资源成功
                .json({
                    status: 1,
                    data,
                    message: '创建用户成功'
                })
        }

    } catch (error) {
        next(error)
    }
    //整体异常捕获
    //next（error）
}

//用户登入
module.exports.login = async (req, res, next) => {
    try {
        //1.获取请求数据 email password 
        let { email, password } = req.body.user
        //2.验证请求数据 ： email password 字段是否正确
        let { error, validate } = validateUserLogin(email, password)
        //3.验证业务逻辑
        //3.1）用户是否存在~
        const user = await User.findByPk(email)
        if (!user) {
            throw new HttpException(401, '用户不存在', 'user not found')
        }
        //3.2)密码是否匹配
        const oldMd5Pwd = user.dataValues.password
        const math =await matchPassword(oldMd5Pwd, password)
        if (!math) {
            throw new HttpException(401, '密码错误', 'password not math')
        }
        //4.返回数据
        //4.1）生成token
        delete user.dataValues.password;
        user.dataValues.token = await sign(
            user.dataValues.username,
            user.dataValues.email
        );
        //4.2)返回数据

        return res.status(200).json({
            status: 1,
            data: user.dataValues,
            message: "用户登入成功",
        })
    } catch (error) {
        next(error);
    }
}


//获取用户信息
module.exports.getUser = async (req, res, next) => {
    try {
        //验证接口权限：验证token=>req.user={username,email}//路由中间件

        //获取请求数据 :req.user
        const { email } = req.user
        //验证请求数据
        //1)接口数据验证 不需要
        //2)Email 用户是否存在
        const user = await User.findByPk(email)
        if (!user) {
            throw new HttpException(401, '用户不存在', 'user not found')
        }
        //返回数据
        //去除password字段
        delete user.dataValues.password
        //添加token
        user.dataValues.token = req.token
        //返回用户数据
        return res.status(200)
            .json({
                status: 1,
                message: '获取用户信息成功',
                data: user.dataValues
            })
    } catch (error) {
        next(error)
    }
}


//修改用户信息

module.exports.updateUser = async (req, res, next) => {
    try {
        //验证接口权限
        //获取请求数据 ：req.email
        const { email } = req.user
        //验证请求数据 ：email验证用户是否存在
        const user = await User.findByPk(email)
        if (!user) {
            throw new HttpException(401, "用户不存在", "user not found")
        }
        //修改用户数据
        //1）获取请求数据 body 数据 =>更新的信息
        const bodyUser = req.body.user
        //判断更新字段是否存在：字段不确定
        if (bodyUser) {
            const username = bodyUser.username ? bodyUser.username : user.username
            const bio = bodyUser.bio ? bodyUser.bio : user.bio
            const avatar = bodyUser.avatar ? bodyUser.avatar : user.avatar
            //如果更新password：需要加密后更新

            let password = user.password
            if (bodyUser.password) {
                password = await md5Password(bodyUser.password)
            }
            //2）更新操作
            const updateUser = await user.update({ username, bio, avatar, password })
            //返回数据
            //1)去除password
            delete updateUser.dataValues.password
            //2)添加token> 注意重新生成 因为username可能发生变化
            updateUser.dataValues.token = await sign(username, email)
            //3）返回用户数据
            return res.status(200) 
                .json({
                    status: 1,
                    message: '修改用户信息成功',
                    data: user.dataValue
                })
        } else {
            throw new HttpException(401, "数据更新不能为空", "update body is unll")

        }
    } catch (error) {
        next(error)
    }
}
