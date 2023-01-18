const userRouter = require('../routes/users')
const followRouter = require('../routes/follow')
const tagRouter = require('../routes/tags')
const articleRouter = require('../routes/articles')
const favoriteRouter = require('../routes/favorites')
const commentRouter = require('../routes/comments')

const initRoute = (app)=>{
    app.use('/api/v1/users',userRouter)
    app.use('/api/v1/follow',followRouter)
    app.use('/api/v1/tags',tagRouter)
    app.use('/api/v1/articles',articleRouter)
    app.use('/api/v1/favorites',favoriteRouter)
    app.use('/api/v1/comments',commentRouter)
}

module.exports =initRoute