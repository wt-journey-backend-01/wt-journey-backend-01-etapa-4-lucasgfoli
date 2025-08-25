/**
 * @swagger
 * tags:
 *   name: Agentes
 *   description: Endpoints para gerenciamento de agentes
 */

/**
 * @swagger
 * /agentes:
 *   get:
 *     summary: Retorna todos os agentes
 *     tags: [Agentes]
 *     parameters:
 *       - in: query
 *         name: dataInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial para filtrar agentes pela data de incorporação
 *       - in: query
 *         name: dataFim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final para filtrar agentes pela data de incorporação
 *       - in: query
 *         name: dataDeIncorporacao
 *         schema:
 *           type: string
 *           format: date
 *         description: Data exata de incorporação para filtro
 *     responses:
 *       200:
 *         description: Lista de agentes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Agente'
 */

/**
 * @swagger
 * /agentes:
 *   post:
 *     summary: Cadastra um novo agente
 *     tags: [Agentes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AgenteInput'
 *     responses:
 *       201:
 *         description: Agente criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Agente'
 */
/**
 * @swagger
 * /agentes/{id}:
 *   get:
 *     summary: Retorna um agente pelo ID
 *     tags: [Agentes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do agente
 *     responses:
 *       200:
 *         description: Dados do agente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Agente'
 *       404:
 *         description: Agente não encontrado
 *
 *   put:
 *     summary: Atualiza um agente pelo ID (substituição total)
 *     tags: [Agentes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do agente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AgenteInput'
 *     responses:
 *       200:
 *         description: Agente atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Agente'
 *       404:
 *         description: Agente não encontrado
 *
 *   patch:
 *     summary: Atualiza parcialmente um agente pelo ID
 *     tags: [Agentes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do agente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               dataDeIncorporacao:
 *                 type: string
 *                 format: date
 *               cargo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Agente atualizado parcialmente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Agente'
 *       400:
 *         description: Erro na validação dos dados
 *       404:
 *         description: Agente não encontrado
 *
 *   delete:
 *     summary: Remove um agente pelo ID
 *     tags: [Agentes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do agente
 *     responses:
 *       204:
 *         description: Agente removido com sucesso
 *       404:
 *         description: Agente não encontrado
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Agente:
 *       type: object
 *       required:
 *         - id
 *         - nome
 *         - dataDeIncorporacao
 *         - cargo
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID do agente
 *         nome:
 *           type: string
 *           description: Nome do agente
 *         dataDeIncorporacao:
 *           type: string
 *           format: date
 *           description: Data de incorporação (YYYY-MM-DD)
 *         cargo:
 *           type: string
 *           description: Cargo do agente
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174000"
 *         nome: "Maria Silva"
 *         dataDeIncorporacao: "2019-05-15"
 *         cargo: "Investigador"
 * 
 *     AgenteInput:
 *       type: object
 *       required:
 *         - nome
 *         - dataDeIncorporacao
 *         - cargo
 *       properties:
 *         nome:
 *           type: string
 *         dataDeIncorporacao:
 *           type: string
 *           format: date
 *         cargo:
 *           type: string
 *       example:
 *         nome: "Maria Silva"
 *         dataDeIncorporacao: "2019-05-15"
 *         cargo: "Investigador" 
 */

const express = require('express')
const router = express.Router()
const agentesController = require('../controllers/agentesController.js')

router.get('/', agentesController.getAllAgentes)
router.get('/:id', agentesController.getAgenteById)
router.post('/', agentesController.createAgente)
router.put('/:id', agentesController.updateAgente)
router.patch('/:id', agentesController.patchAgente)
router.delete('/:id', agentesController.deleteAgente)

module.exports = router