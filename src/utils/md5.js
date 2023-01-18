// --------------------------------md5
const md5 =require('md5')

const SALT = 'salt'

const md5Password = (password)=>{
    return new Promise((resolve,reject)=>{
        const md5PWD =md5(password+SALT)
        resolve(md5PWD)
    })
}

const matchPassword =(oldMd5Pwd,password)=>{
    return new Promise((resolve,reject)=>{
        const newMd5PWD =md5(password+SALT)
        if(oldMd5Pwd === newMd5PWD){
            resolve(true)
        }else{
            resolve(false)
        }
    })
}


module.exports={md5Password,matchPassword}

// async function test1(){
//     const password ='abc'
//     const md5Pwd =await md5Password(password)
//     console.log('md5Pwd:',md5Pwd);
//     const match =await matchPassword(md5Pwd,'abc')
//     console.log('password match',match);
// }
// test1()


