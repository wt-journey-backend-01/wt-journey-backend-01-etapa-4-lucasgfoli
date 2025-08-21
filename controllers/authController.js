const usuariosRepository = require('../repositories/usuariosRepository')
const handlerError = require('../utils/errorHandler')
const validarSenha = require('../utils/validarSenha')

async function getAllUsers(req, res) {
    try {
        const usuarios = await usuariosRepository.getAllUsuarios()
        res.status(200).json(Array.isArray(usuarios) ? usuarios : [])
    }
    catch (error) {
        handlerError(res, error)
    }
}

async function createUser(req, res) {
    try {
        const { nome, email, senha } = req.body

        if( !nome || !email || !senha)
            return res.status(400).json({message: 'Todos os campos são obrigatórios!'})

        if(!validarSenha(senha))
            return res.status(400).json({message: 'A senha deve conter no mínimo 8 caracteres, uma letra maiúscula e uma minúscula, um número e um caractere especial.'})
        
        const newUser = { nome, email, senha }
        const userCreated = await usuariosRepository.create(newUser)

        return res.status(201).json(userCreated)
    
    } catch (error) {
        handlerError(res, error)
    }
}

module.exports = {
    getAllUsers,
    createUser
}