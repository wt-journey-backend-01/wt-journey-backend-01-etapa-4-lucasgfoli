require('dotenv').config()
const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
const agentesRouter = require('./routes/agentesRouter.js')
const casosRouter = require('./routes/casosRouter.js')
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./docs/swagger.js')

app.use(express.json())
app.use('/agentes', agentesRouter)
app.use('/casos', casosRouter)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.listen(PORT, '0.0.0.0', ()=> {
    console.log(`🚀Servidor rodando na porta ${PORT}`)
})