const validator =require('validator')

//验证：文章创建
module.exports.validateCreateArticle=(title,description,body)=>{
    let error={}
    if(validator.isEmpty(title)){
        error.title  = '文章标题不能为空'
    }
    if(validator.isEmpty(description)){
        error.description  = '文章描述不能为空'
    }
    if(validator.isEmpty(body)){
        error.body  = '文章内容不能为空'
    }

    let validate = Object.keys(error).length<1  //true 验证通过

    return {error,validate}
}
