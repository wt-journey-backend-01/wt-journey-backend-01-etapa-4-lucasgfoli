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
            return res.status(404).json({ message: 'Usuário não encontrado', email: 'Usuário não encontrado' })

        const isPasswordValid = await bcrypt.compare(senha, user.senha)

        if (!isPasswordValid)
            return res.status(401).json({ message: 'Senha inválida', senha: 'Senha inválida' })

        const token = jwt.sign({ id: user.id, nome: user.nome, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: '1d'
        })

        res.status(200).json({ access_token: token })
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

        if ( extraFields.length > 0)
            return res.status(400).json({message: `Campos extras não permitidos: ${extraFields.join(', ')}`})

        if (!nome || typeof nome !== 'string' || nome.trim() === '')
            return res.status(400).json({ message: 'O nome é obrigatório e não deve ser uma string vazia' })

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (!email || !emailRegex.test(email))
            return res.status(400).json({ message: 'Email inválido ou ausente' })

        if (!senha || !validarSenha(senha))
            return res.status(400).json({ message: 'Senha inválida. Deve conter no mínimo 8 caracteres, com letras maiúsculas, minúsculas, números e caracteres especiais.' })

        const user = await usuariosRepository.findByEmail(email)

        if (user) 
            return res.status(400).json({ message: 'Usuário já existe', email: 'Usuário já existe' })

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
    try{
        const token = req.headers['authorization']?.split(' ')[1];

        if (!token)
            return res.status(400).json({ message: 'Token não fornecido' });

        revokedTokens.push(token);

        res.status(200).json({ message: 'Logout realizado com sucesso' });

    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        res.status(500).json({ message: 'Erro ao fazer logout', error: error.message });
    }
}

module.exports = {
    login,
    signUp,
    logout,
    revokedTokens
}