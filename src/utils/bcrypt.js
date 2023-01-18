//-------------------------------bcrypt

const bcrypt = require('bcrypt')

const SALT = 10
const hashPassword = (password)=>{
    return new Promise((resolve,reject)=>{
        bcrypt.hash(password,SALT,(err,encrypted)=>{
            if(err){
                reject(err)
            }
            resolve(encrypted)
        })
    })
}

const matchPassword =(oldHasPwd,password)=>{
    return new Promise(async(resolve,reject)=>{
      
      const match = await  bcrypt.compare(password,oldHasPwd)
      console.log(match)
    })
}

// async function test2(){
//     const password ='abc'
//     const hashPwd =await hashPassword(password)
//     console.log('hashPwd:',hashPwd);
//     const match =await matchPassword(hashPwd,'abc')
//     console.log('password match',match);
// }
// test2()
