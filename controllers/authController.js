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

        if (!isPasswordValid)
            return next(new handlerError('Senha inválida', 401, { senha: 'Senha inválida' }))

        const token = jwt.sign({ id: user.id, nome: user.nome, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: '1d'
        })

        res.status(200).json({ acces_token: token })
    } catch (error) {
        next(new handlerError('Usuário não encontrado', 500, error.message))
    }
}

// Cadastro -> 

const signUp = async (req, res, next) => {
    try {
        const allowedFields = ['nome', 'email', 'senha']
        const receivedFields = Object.keys(req.body)

        const extraFields = receivedFields.filter(field => !allowedFields.includes(field))

        if ( extraFields.length > 0)
            return res.status(400).json({message: `Campos extras não permitidos: ${extraFields.join(', ')}`})

        if (!nome || typeof nome !== string || nome.trim() === '')
            return res.status(400).json({ message: 'O nome é obrigatório e não deve ser uma string vazia' })

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (!email || !emailRegex.test(email))
            return res.status(400).json({ message: 'Email inválido ou ausente' })

        if (!senha || !validarSenha(senha))
            return res.status(400).json({ message: 'Senha inválida. Deve conter no mínimo 8 caracteres, com letras maiúsculas, minúsculas, números e caracteres especiais.' })

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