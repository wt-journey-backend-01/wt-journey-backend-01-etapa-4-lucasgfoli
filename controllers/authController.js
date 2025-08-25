const usuariosRepository = require('../repositories/usuariosRepository')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const handlerError = require('../utils/errorHandler')
const validarSenha = require('../utils/validarSenha')

// Login -> JWT
const login = async (req, res, next) => {
    try {
        const { email, senha } = req.body

        const user = await usuariosRepository.findByEmail(email)

        if (!user) {
            return next(
                new handlerError('user not found', 404, {
                    email: 'Usuário não encontrado',
                })
            )
        }

        const isPasswordValid = await bcrypt.compare(senha, user.senha)

        if (!isPasswordValid) {
            return next(
                new handlerError('Invalid password'), 401, {
                senha: 'Senha inválida',
            }
            )
        }

        const token = jwt.sign({ id: user.id, nome: user.nome, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: '1d'
        })

        res.status(200).json({ message: 'Sucesso no login', token })
    } catch (error) {
        next(new handlerError('Usuário não encontrado', 500, error.message))
    }
}

// Cadastro -> 

const signUp = async (req, res, next) => {
    try {
        const { nome, email, senha } = req.body

        const user = await usuariosRepository.findByEmail(email)

        if (user) {
            return next(new handlerError('Usuário já existe'), 400, {
                email: 'Usuário já existe'
            })
        }

        const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS))
        const hashSenha = await bcrypt.hash(senha, salt)

        const novoUsuario = await usuariosRepository.insertUser({
            nome,
            email,
            senha: hashSenha,
        })

        res.status(201).json({
            message: 'Usuario criado com sucesso',
            usuario: novoUsuario,
        })
    } catch (error) {
        next(new handlerError('Erro ao criar usuario', 500, error.message))
    }
}

module.exports = {
    login,
    signUp
}