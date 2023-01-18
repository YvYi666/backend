const errorMiddleware = (error,req,res,nest)=>{

    const status =error.status  || 500
    const message =error.message ||'服务端错误'
    const errors =error.errors  ||'server fu worng'

    res.status(status)
        .json({
            code:0,
            massage:message,
            errors:errors,
        })
}
module.exports = errorMiddleware