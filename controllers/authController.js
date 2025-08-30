const usuariosRepository = require('../repositories/usuariosRepository')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const handleError = require('../utils/errorHandler')

const login = async (req, res) => {
    try {
        const { email, senha } = req.body
        const user = await usuariosRepository.findByEmail(email)

        if (!user)
            return res.status(404).json({ errors: { email: 'Usuário não encontrado' } })

        const isPasswordValid = await bcrypt.compare(senha, user.senha)
        if (!isPasswordValid)
            return res.status(401).json({ errors: { senha: 'Senha inválida' } })

        const token = jwt.sign({ id: user.id, nome: user.nome, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' })
        res.status(200).json({ acess_token: token })
    } catch (error) {
        return handleError(res, 500, error.message)
    }
}

const signUp = async (req, res) => {
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

        if (!nome || typeof nome !== 'string' || nome.trim() === '')
            return res.status(400).json({ errors: { nome: 'O nome é obrigatório e não pode ser vazio' } })

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!email || typeof email !== 'string' || !emailRegex.test(email))
            return res.status(400).json({ errors: { email: 'Email inválido ou ausente' } })

        if (!senha || !validarSenha(senha))
            return res.status(400).json({ errors: { senha: 'Senha inválida. Deve conter no mínimo 8 caracteres, com letras maiúsculas, minúsculas, números e caracteres especiais.' } })

        const user = await usuariosRepository.findByEmail(email)
        if (user)
            return res.status(400).json({ errors: { email: 'Usuário já existe' } })

        const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10
        const salt = await bcrypt.genSalt(saltRounds)
        const hashSenha = await bcrypt.hash(senha, salt)

        const novoUsuario = await usuariosRepository.insertUser({ nome, email, senha: hashSenha })

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

const logout = (req, res) => {
    res.status(200).json({ message: 'Logout realizado com sucesso.' })
}

function validarSenha(senha) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/
    return regex.test(senha)
}

module.exports = {
    login,
    signUp,
    logout
}
