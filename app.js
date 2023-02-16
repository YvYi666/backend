require('dotenv').config({ path: '.env' })

const initDB =require('./src/init/initDB')
const initServer =require('./src/init/initServer')
const initRoute =require('./src/init/initRoute')
//引入
const cors =require('cors')
const morgan =require('morgan')

const noMatchMiddleware = require('./src/middleware/404.middleware')
const errorMiddleware   = require('./src/middleware/error.middleware')

const express = require('express')
const app = express()

//中间件
app.use(cors({credentials:true,origin:true}))//跨域
app.use(express.json())//解析
app.use(morgan('tiny'))//http 请求日志

//静态服务
app.use('/static',express.static('public'))

//初始化路由    
initRoute(app)

//404
app.use(noMatchMiddleware)
//统一错误处理
app.use(errorMiddleware)

const main =async ()=>{
    //初始化数据库服务
    await initDB()
    //启动node服务
    await initServer(app)
}
main()

//接口启动后一般会请求路由根据路由找到
// controller控制器：请求进来路由分配过来了验证调度   ->service  
// 不同的控制器可以调相同的service                  -> service  ->model 数据层ORM的操作链接数据库后执行SQL语句
//测试一下git