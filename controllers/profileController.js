const handleError = require('../utils/errorHandler')

const getProfile = async (req, res, next) => {
    try{

        const user = req.user
        
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