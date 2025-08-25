const jwt = require('jsonwebtoken')

function authMiddleware (req, res, next){
    const authHeader = req.headers.authorization

    if(!authHeader)
        return res.status(401).json({message: 'Token não fornecido'})

    const token = authHeader.split(' ')[1]

    if(!token)
        return res.status(401).json({message: 'Token mal formatado'})

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = decoded

        next()
    }
    catch (error) {
        return res.status(401).json({message: 'Token inválido'})
    }
}

module.exports = authMiddleware

// Melhorar tratamento desse código