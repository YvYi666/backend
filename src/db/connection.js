const sequelize =require('./sequelize')
const dbConnection = async () => {
    return new Promise(async(resolve,reject)=>{
        try {
            await sequelize.authenticate();//函数测试数据库连接成功与否
            console.log('Connection mysql has been established successfully.');
            resolve()
        } catch (error) {
            console.error('Unable mysql to connect to the database:', error);
            reject(error)
        }
    })
}
module.exports = dbConnection