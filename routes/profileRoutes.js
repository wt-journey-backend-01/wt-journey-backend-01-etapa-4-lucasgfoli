const express = require('express')
const profileController = require('../controllers/profileController.js')
const authMiddleware = require('../middlewares/authMiddleware.js')

const router = express.Router()

router.get('/me', authMiddleware, profileController.getProfile)

module.exports = router