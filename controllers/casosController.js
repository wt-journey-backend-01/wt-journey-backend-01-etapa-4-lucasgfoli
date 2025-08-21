const casosRepository = require("../repositories/casosRepository")
const agentesRepository = require("../repositories/agentesRepository")
const handlerError = require('../utils/errorHandler')

async function getAllCasos(req, res) {
    try {
        const { status, agente_id, search, orderBy, order } = req.query
        let casos = await casosRepository.findAll()

        if (search) {
            const termo = search.toLowerCase()
            casos = casos.filter(caso =>
                caso.titulo.toLowerCase().includes(termo) ||
                caso.descricao.toLowerCase().includes(termo)
            )
        }

        if (status) {
            const statusValidos = ['aberto', 'solucionado']
            if (!statusValidos.includes(status))
                return res.status(400).json({ message: "O status do caso deve ser 'aberto' ou 'solucionado'." })

            casos = casos.filter(caso => caso.status === status)
        }

        if (agente_id) {
            const agenteExistente = await agentesRepository.findById(agente_id)
            if (!agenteExistente)
                return res.status(404).json({ message: "Agente não encontrado com o agente_id fornecido." })

            casos = casos.filter(caso => caso.agente_id === agente_id)
        }

        if (orderBy) {
            const camposValidos = ['titulo', 'status', 'agente_id']
            if (!camposValidos.includes(orderBy))
                return res.status(400).json({
                    message: `Campo para ordenação inválido. Use: ${camposValidos.join(', ')}.`
                })

            casos.sort((a, b) => {
                const ordem = order === 'desc' ? -1 : 1
                if (a[orderBy] < b[orderBy]) return -1 * ordem
                if (a[orderBy] > b[orderBy]) return 1 * ordem
                return 0
            })
        }

        if (order && order !== 'asc' && order !== 'desc') {
            return res.status(400).json({ message: "Parâmetro 'order' inválido. Use 'asc' ou 'desc'." })
        }

        const casosComMesmoAgente = await Promise.all(
            casos.map(async caso => ({
                ...caso,
                agente: await agentesRepository.findById(caso.agente_id)
            })))

        res.status(200).json(Array.isArray(casosComMesmoAgente) ? casosComMesmoAgente : [])
    } catch (error) {
        handlerError(res, error)
    }
}

async function getSpecificCase(req, res) {
    try {
        const { id } = req.params
        const caso = await casosRepository.findById(id)

        if (!caso)
            return res.status(404).json({ message: "Caso não encontrado." })
    const agente = await agentesRepository.findById(caso.agente_id)
    res.status(200).json({ ...caso, agente })
    } catch (error) {
        handlerError(res, error)
    }
}

async function createCase(req, res) {
    try {
        const { titulo, descricao, status, agente_id } = req.body
        if (!titulo || !descricao || !status || !agente_id)
            return res.status(400).json({ message: "Todos os campos são obrigatórios." })
        if (typeof titulo !== 'string')
            return res.status(400).json({ message: "O título deve ser uma string." })
        if (typeof descricao !== 'string')
            return res.status(400).json({ message: "A descrição deve ser uma string." })
        if (status !== "aberto" && status !== "solucionado")
            return res.status(400).json({ message: "O status do caso deve ser 'aberto' ou 'solucionado'." })
        const agenteExistente = await agentesRepository.findById(agente_id)
        if (!agenteExistente)
            return res.status(404).json({ message: "Agente não encontrado com o agente_id fornecido." })
        const newCase = { titulo, descricao, status, agente_id }
        const createdCase = await casosRepository.create(newCase)
        res.status(201).json(createdCase)
    } catch (error) {
        handlerError(res, error)
    }
}

async function updateCase(req, res) {
    try {
        const { id } = req.params
        const { id: idBody, titulo, descricao, status, agente_id } = req.body
        if (idBody && idBody !== id)
            return res.status(400).json({ message: "O campo 'id' não pode ser alterado." })
        if (!titulo || !descricao || !status || !agente_id)
            return res.status(400).json({ message: "Todos os campos são obrigatórios." })
        if (typeof titulo !== 'string')
            return res.status(400).json({ message: "O título deve ser uma string." })
        if (typeof descricao !== 'string')
            return res.status(400).json({ message: "A descrição deve ser uma string." })
        if (status !== "aberto" && status !== "solucionado")
            return res.status(400).json({ message: "O status do caso deve ser 'aberto' ou 'solucionado'." })
        const agenteExistente = await agentesRepository.findById(agente_id)
        if (!agenteExistente)
            return res.status(404).json({ message: "Agente não encontrado com o agente_id fornecido." })
        const updatedCase = await casosRepository.update(id, { titulo, descricao, status, agente_id })
        if (!updatedCase)
            return res.status(404).json({ message: "Caso não encontrado." })
        res.status(200).json(updatedCase)
    } catch (error) {
        handlerError(res, error)
    }
}

async function patchCase(req, res) {
    try {
        const { id } = req.params
        const updates = req.body
        const camposValidos = ['titulo', 'descricao', 'status', 'agente_id']

        if ('id' in updates)
            return res.status(400).json({ message: "O campo 'id' não pode ser alterado." })

        const camposAtualizaveis = Object.keys(updates).filter(campo => {
            return camposValidos.includes(campo)
        })

        if (updates.titulo && typeof updates.titulo !== 'string')
            return res.status(400).json({ message: "O título deve ser uma string." })

        if (updates.descricao && typeof updates.descricao !== 'string')
            return res.status(400).json({ message: "A descrição deve ser uma string." })

        if (camposAtualizaveis.length === 0)
            return res.status(400).json({ message: "Deve conter pelo menos um campo para atualização." })

        if (updates.status && updates.status !== "aberto" && updates.status !== "solucionado")
            return res.status(400).json({ message: "O status do caso deve ser 'aberto' ou 'solucionado'." })

        if (updates.agente_id) {
            const agenteExistente = await agentesRepository.findById(updates.agente_id)
            if (!agenteExistente)
                return res.status(404).json({ message: "Agente não encontrado com o agente_id fornecido." })
        }

        const updatedCase = await casosRepository.patchById(id, updates)
        if (!updatedCase)
            return res.status(404).json({ message: "Caso não encontrado." })
        res.status(200).json(updatedCase)
    } catch (error) {
        handlerError(res, error)
    }
}

async function deleteCase(req, res) {
    try {
        const { id } = req.params
        const casoDeletado = await casosRepository.findById(id)
        if (!casoDeletado)
            return res.status(404).json({ message: "Caso não encontrado." })
        await casosRepository.deleteById(id)
        res.status(204).send()
    } catch (error) {
        handlerError(res, error)
    }
}

module.exports = {
    getAllCasos,
    getSpecificCase,
    createCase,
    updateCase,
    deleteCase,
    patchCase
}