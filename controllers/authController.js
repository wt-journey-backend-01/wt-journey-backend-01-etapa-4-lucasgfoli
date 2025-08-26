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

        if (!user)
            return res.status(404).json({ errors: { email: 'Usuário não encontrado' } })

        const isPasswordValid = await bcrypt.compare(senha, user.senha)

        if (!isPasswordValid)
            return res.status(401).json({ errors: { senha: 'Senha inválida' } })

        const token = jwt.sign({ id: user.id, nome: user.nome, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: '1d'
        })

        res.status(200).json({ acess_token: token })
    } catch (error) {
        next(new handlerError('Usuário não encontrado', 500, error.message))
    }
}

// Cadastro -> 

const signUp = async (req, res, next) => {
    try {
        const { nome, email, senha } = req.body
        const allowedFields = ['nome', 'email', 'senha']
        const receivedFields = Object.keys(req.body)
        const extraFields = receivedFields.filter(field => !allowedFields.includes(field))
        const missingFields = allowedFields.filter(field => !receivedFields.includes(field))

        if (missingFields.length > 0)
            return res.status(400).json({ message: `Campos obrigatórios ausentes: ${missingFields.join(', ')}` })

        if (extraFields.length > 0)
            return res.status(400).json({ message: `Campos extras não permitidos: ${extraFields.join(', ')}` })

        if (nome === undefined || nome === null || typeof nome !== 'string' || nome.trim() === '') {
            return res.status(400).json({ errors: { nome: 'O nome é obrigatório e não pode ser vazio' } });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (email === undefined || email === null || typeof email !== 'string' || !emailRegex.test(email))
            return res.status(400).json({ errors: { email: 'Email inválido ou ausente' } })

        if (senha === undefined || senha === null || !validarSenha(senha))
            return res.status(400).json({ errors: { senha: 'Senha inválida. Deve conter no mínimo 8 caracteres, com letras maiúsculas, minúsculas, números e caracteres especiais.' } })

        const user = await usuariosRepository.findByEmail(email)

        if (user)
            return res.status(400).json({ errors: { email: 'Usuário já existe' } })

        const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10
        const salt = await bcrypt.genSalt(saltRounds)
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

const revokedTokens = [];

const logout = (req, res) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        const secret = process.env.JWT_SECRET

        if (!token)
            return res.status(400).json({ errors: { token: 'Token não fornecido' } });

        jwt.verify(token, secret, (err, decoded) => {
            if (err)
                return res.status(401).json({ errors: { token: 'Token inválido ou expirado' } });


            revokedTokens.push(token);
            res.status(200).json({ message: 'Logout realizado com sucesso' });
        })

    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        res.status(500).json({ message: 'Erro ao fazer logout', error: error.message });
    }
}

const getMe = async (req, res, next) => {
    try {
        const userId = req.user.id
        const user = await usuariosRepository.findById(userId)

        if (!user)
            return res.status(404).json({ error: { user: 'Usuário não encontrado' } })

        const { senha, ...userWithoutSenha } = user

        res.status(200).json(userWithoutSenha)
    }
    catch (error) {
        next(new handlerError('Erro ao buscar usuário', 500, error.message))
    }
}

module.exports = {
    login,
    signUp,
    logout,
    revokedTokens,
    getMe
}