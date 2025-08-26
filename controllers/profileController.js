const handleError = require('../utils/errorHandler')
const usuariosRepository = require('../repositories/usuariosRepository')

const getProfile = async (req, res, next) => {
    try{
        const user = await usuariosRepository.findUserById(req.user.id)
        
        if( !user ){
            return next(new handleError('user not found', 404, {
                email: 'User not found'
            }))
        }

        res.status(200).json(user)

    } catch (error){
        next(new handleError('Error getting user profile', 500, error.message))
    }
}

module.exports = { getProfile }