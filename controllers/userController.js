const handleError = require('../utils/errorHandler')
const usuariosRepository = require('../repositories/usuariosRepository')

const deleteUserById = async (req, res  ) => {
    try{
        const {id} = req.params

        if (!id)
            return handleError(res, 400, 'Id inválido.')

        const userDeleted = await usuariosRepository.deleteById(id)

        if (!userDeleted)
            return handleError(res, 404, 'Usuário não encontrado.')

        return res.status(200).json({message: 'Usuario excluído com sucesso.'})

    } catch (error){
        return handleError(res, 500, error.message)
    }
}

module.exports = { deleteuserById: deleteUserById }