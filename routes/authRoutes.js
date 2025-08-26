const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')

router.post('/register', authController.signUp)
router.post('/login', authController.login)
router.delete('/logout', authController.logout)

module.exports = router