/**
 * @swagger
 * tags:
 *   name: Casos
 *   description: Endpoints para gerenciamento de casos
 */

/**
 * @swagger
 * /casos:
 *   get:
 *     summary: Retorna todos os casos
 *     tags: [Casos]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [aberto, solucionado]
 *         description: Filtrar casos pelo status
 *       - in: query
 *         name: agente_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar casos por agente
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Termo de busca no título ou descrição
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           enum: [titulo, status, agente_id]
 *         description: Campo usado para ordenação
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Ordem da ordenação
 *     responses:
 *       200:
 *         description: Lista de casos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Caso'
 * 
 *   post:
 *     summary: Cadastra um novo caso
 *     tags: [Casos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CasoInput'
 *     responses:
 *       201:
 *         description: Caso criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Caso'
 */

/**
 * @swagger
 * /casos/{id}:
 *   get:
 *     summary: Retorna um caso pelo ID
 *     tags: [Casos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do caso
 *     responses:
 *       200:
 *         description: Caso encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Caso'
 *       404:
 *         description: Caso não encontrado
 * 
 *   put:
 *     summary: Atualiza um caso por completo
 *     tags: [Casos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do caso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CasoInput'
 *     responses:
 *       200:
 *         description: Caso atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Caso'
 *       404:
 *         description: Caso não encontrado
 * 
 *   patch:
 *     summary: Atualiza parcialmente um caso
 *     tags: [Casos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do caso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               descricao:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [aberto, solucionado]
 *               agente_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Caso atualizado parcialmente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Caso'
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Caso não encontrado
 * 
 *   delete:
 *     summary: Remove um caso pelo ID
 *     tags: [Casos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do caso
 *     responses:
 *       204:
 *         description: Caso removido com sucesso
 *       404:
 *         description: Caso não encontrado
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Caso:
 *       type: object
 *       required:
 *         - id
 *         - titulo
 *         - descricao
 *         - status
 *         - agente_id
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         titulo:
 *           type: string
 *         descricao:
 *           type: string
 *         status:
 *           type: string
 *           enum: [aberto, solucionado]
 *         agente_id:
 *           type: string
 *           format: uuid
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174000"
 *         titulo: "Investigação de roubo"
 *         descricao: "Relato de roubo em estabelecimento comercial"
 *         status: "aberto"
 *         agente_id: "987e6543-e21b-12d3-a456-426614174999"
 * 
 *     CasoInput:
 *       type: object
 *       required:
 *         - titulo
 *         - descricao
 *         - status
 *         - agente_id
 *       properties:
 *         titulo:
 *           type: string
 *         descricao:
 *           type: string
 *         status:
 *           type: string
 *           enum: [aberto, solucionado]
 *         agente_id:
 *           type: string
 *           format: uuid
 *       example:
 *         titulo: "Investigação de roubo"
 *         descricao: "Relato de roubo em estabelecimento comercial"
 *         status: "aberto"
 *         agente_id: "987e6543-e21b-12d3-a456-426614174999"
 */

const express = require('express')
const router = express.Router()
const casosController = require('../controllers/casosController.js')

router.get('/', casosController.getAllCasos)
router.get('/:id', casosController.getSpecificCase)
router.post('/', casosController.createCase)
router.put('/:id', casosController.updateCase)
router.patch('/:id', casosController.patchCase)
router.delete('/:id', casosController.deleteCase)

module.exports = router