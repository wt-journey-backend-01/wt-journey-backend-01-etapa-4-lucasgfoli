const usuariosRepository = require('../repositories/usuariosRepository')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const handleError = require('../utils/errorHandler')

// Login -> JWT
const login = async (req, res) => {
    try {
        const { email, senha } = req.body

        const user = await usuariosRepository.findByEmail(email)

        if (!user) {
            return handleError(res, 400, 'User not found')
        }

        const isPasswordValid = await bcrypt.compare(senha, user.senha)

        if (!isPasswordValid) {
            return handleError(res, 401, 'Senha inválida')
        }

        const token = jwt.sign({ id: user.id, nome: user.nome, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: '1d'
        })

        res.status(200).json({ message: 'Sucesso no login', token })
    } catch (error) {
        return handleError(res, 500, error.message)
    }
}

// Cadastro -> 

const signUp = async (req, res) => {
    try {
        const { nome, email, senha } = req.body

        const user = await usuariosRepository.findByEmail(email)

        if (user) {
            return handleError(res, 401, 'Usuário já existe')
        }

        const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS))
        const hashSenha = await bcrypt.hash(senha, salt)

        // Gerand
        const novoUsuario = await usuariosRepository.insertUser({
            nome,
            email,
            senha: hashSenha,
        })

        res.status(201).json({
            message: 'Usuario criado com sucesso',
            usuario: {
                id: novoUsuario.id,
                nome: novoUsuario.nome,
                email: novoUsuario.email
            }
        })
    } catch (error) {
        return handleError(res, 500, error.message)
    }
}

// Logout de usuários
const logout = (req, res) => {
    // Apenas retorna mensagem, não altera banco
    res.status(200).json({ message: 'Logout realizado com sucesso.' })
}

module.exports = {
    login,
    signUp,
    logout
}