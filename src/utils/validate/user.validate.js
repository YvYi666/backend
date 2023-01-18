const validator =require('validator')

//验证：用户注册
module.exports.validateCreateUser=(username,password,email)=>{
    let error={}
    if(validator.isEmpty(username)){
        error.username  = '用户名不能为空'
    }
    if(validator.isEmpty(password)){
        error.password  = '密码不能为空'
    }
    if(validator.isEmpty(email)){
        error.email  = '邮箱不能为空'
    }
    if(!validator.isEmpty(email)&&!validator.isEmail(email)){
        error.email  = '邮箱格式不正确'
    }

    let validate = Object.keys(error).length<1  //true 验证通过

    return {error,validate}
}

//验证：用户登入

module.exports.validateUserLogin=(email,password)=>{
    let error={}
    
    if(validator.isEmpty(email)){
        error.email  = '邮箱不能为空'
    }
    if(validator.isEmpty(password)){
        error.password  = '密码不能为空'
    }
    if(!validator.isEmpty(email)&&validator.isEmail(email)){
        error.email  = '邮箱格式不正确'
    }

    let validate = Object.keys(error).length<1  

    return {error,validate}
}