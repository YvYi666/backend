const HttpException = require("../../exceptions/http.exception");
const { decode } = require("../../utils/jwt");

module.exports.authMiddleware = async (req, res, next) => {
    // console.log('authMiddleware');

    // console.log(req.headers);

    /**
     * {
         authorization: 'Token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IjY2NiIsImVtYWlsIjoiemhhbmdzYW5AcXEuY29tIiwiaWF0IjoxNjczNDI3NDEwfQ.X0_CwMLZBw94i1z8fJ3glcLo86xxw3qXVd7c3WSOptc',
         'user-agent': 'PostmanRuntime/7.29.0',
         accept: 
         'cache-control': 'no-cache',
         'postman-token': 'e9c73fba-c52c-42d7-9430-698207aff020',
         host: 'localhost:8000',
         'accept-encoding': 'gzip, deflate, br',
         connection: 'keep-alive'
}
     */


    //01 authorization header
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return next(new HttpException(401, '必须提供authorization', 'authorization missing'))
    }
    //02 验证token Type   
    const authHeaderArr = authHeader.split(' ')

    if (authHeaderArr[0] !== 'Token') {
        return next(new HttpException(401, 'authorization格式错误,格式 Token content', 'Token missing'))
    }

    //03 验证token内容
    if (!authHeaderArr[1]) {
        return next(new HttpException(401, 'authorization格式错误,格式 Token content', 'Token content missing'))
    }

    //03 解签验证
    try {
        const user = await decode(authHeaderArr[1])
        if (!user) {
            return next(new HttpException(401, 'token 内容不存在', 'token decode error'))
        }
        req.user = user //req 追加解签后的user信息
        req.token = authHeaderArr[1] //req 追加token
        return next()

    } catch (error) {
        // jwt验证失败 ：token 失效，过期等
        return next(new HttpException(401, 'Authorization token 验证失败', e.message))

    }

}