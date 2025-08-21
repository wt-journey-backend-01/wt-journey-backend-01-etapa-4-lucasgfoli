const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')

router.get('/', authController.getAllUsers)
router.get('/:id', authController)
router.post('/', authController)
router.put('/:id', authController)
router.patch('/:id', authController)
router.delete('/:id', authController)

module.exports = router