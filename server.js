require('dotenv').config()

const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
const authMiddleware = require('./middlewares/authMiddleware.js')
const agentesRoutes = require('./routes/agentesRoutes.js')
const casosRoutes = require('./routes/casosRoutes.js')
const authRoutes = require('./routes/authRoutes.js')
const profileRoutes = require('./routes/profileRoutes.js')
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./docs/swagger.js')

// Middleware de login
app.use(((req, res, next) => {
    console.log(
        `${new Date().toLocaleString()} | Requisição: ${req.method} ${req.url}`
    )
    next()
}))

app.use(express.json())
app.use('/agentes', authMiddleware, agentesRoutes)
app.use('/casos', authMiddleware, casosRoutes)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)


app.listen(PORT, '0.0.0.0', ()=> {
    console.log(`🚀Servidor rodando na porta ${PORT}`)
})