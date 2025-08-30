const express = require('express')
const userController = require('../controllers/userController.js')
const authMiddleware = require('../middlewares/authMiddleware')

const router = express.Router()

router.get('/me', authMiddleware, userController.getMe)
router.delete('/:id', authMiddleware, userController.deleteuserById)

module.exports = router
