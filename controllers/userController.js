const handleError = require('../utils/errorHandler')
const usuariosRepository = require('../repositories/usuariosRepository')

const deleteUserById = async (req, res) => {
    try {
        const { id } = req.params

        if (!id)
            return handleError(res, 400, 'Id inválido.')

        const userDeleted = await usuariosRepository.deleteById(id)

        if (!userDeleted)
            return handleError(res, 404, 'Usuário não encontrado.')

        return res.status(200).json({ message: 'Usuario excluído com sucesso.' })

    } catch (error) {
        return handleError(res, 500, error.message)
    }
}

const getMe = async (req, res) => {
    try {
        const user = await usuariosRepository.findUserById(req.user.id)
        if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' })

        const { senha, ...usuarioSemSenha } = user

        res.status(200).json(usuarioSemSenha)
    } catch (error) {
        return handleError(res, 500, error.message)
    }
}

module.exports = { deleteuserById: deleteUserById, getMe }