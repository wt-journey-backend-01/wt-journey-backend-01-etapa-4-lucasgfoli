const jwt = require('jsonwebtoken')
const { revokedTokens } = require('../controllers/authController')

function authMiddleware (req, res, next){
    const authHeader = req.headers.authorization

    if(!authHeader)
        return res.status(401).json({message: 'Acesso negado'})

    const token = authHeader.split(' ')[1]

    if(!token)
        return res.status(401).json({message: 'Token mal formatado'})

    if( revokedTokens.includes(token) )
        return res.status(401).json({message: 'Token inválido'})

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()
    }
    catch (error) {
        console.error('Erro ao verificar o token:', error.message)

        return res.status(500).json({message: 'Problema no servidor. Tente novamente mais tarde'})
    }
}

module.exports = authMiddleware