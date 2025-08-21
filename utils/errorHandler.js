function handlerError(res, error, statusCode = 500){
    console.error(error)

    res.status(statusCode).json({
        message: "Ocorreu um erro no servidor.",
        error: error.message || error
    })
}

module.exports = handlerError