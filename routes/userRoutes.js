const express = require('express')
const userController = require('../controllers/userController.js')

const router = express.Router()

router.delete('/:id', userController.deleteuserById)

module.exports = router