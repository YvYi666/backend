const HttpException = require("../exceptions/http.exception");
const Tag = require("../models/tag");

//获取所有标签
module.exports.getTags = async (req, res, next) => {
    try {
        //module查询所有标签
        const tagsAll = await Tag.findAll()
        console.log(tagsAll)
        //标签处理 [tag1,tag2]
        const tags=[]
        if(tagsAll.length>0){
            for(const t of tagsAll){
                tags.push(t.dataValues.name)
            }
        }
        //响应数据
        res.status(200)
            .json({
                status: 1,
                message: '获取标签成功',
                data: tags,
            })
    } catch (error) {
        next(error)
    }
}
//添加标签
module.exports.createTag = async (req, res, next) => {
    try {
        //参数获取 字符串 tag
        const tag = req.body.tag
        //标签验证
        //module直接创建
        const tagResult = await Tag.create({ name: tag })
        //标签处理 [tag1,tag2]
        //响应数据
        res.status(201)
            .json({
                status: 1,
                message: '创建标签成功',
                data: tagResult.dataValues.name,
            })
    } catch (error) {
        next(error)
    }
}