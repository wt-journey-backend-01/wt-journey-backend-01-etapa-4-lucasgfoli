const agentesRepository = require('../repositories/agentesRepository')
const handleError = require('../utils/errorHandler')

async function getAllAgentes(req, res) {
    try {
        const agentes = await agentesRepository.findAll()

        res.status(200).json(Array.isArray(agentes) ? agentes : [])

    } catch (error) {

        return handleError(res, 500, error.message)
    }
}

async function getAgenteById(req, res) {
    try {
        const { id } = req.params
        if (!id || isNaN(Number(id))) {
            return res.status(400).json({ message: 'ID inválido.' })
        }

        const agente = await agentesRepository.findById(id)

        if (!agente) {
            return res.status(404).json({ message: 'Agente não encontrado.' })
        }

        res.status(200).json(agente)
    } catch (error) {
        return handleError(res, 500, error.message)
    }
}

async function createAgente(req, res) {
    try {
        const { nome, dataDeIncorporacao, cargo } = req.body
        const cargosValidos = ['delegado', 'investigador', 'escrivao', 'policial']
        if (!nome || typeof nome !== 'string' || !dataDeIncorporacao || !cargo || typeof cargo !== 'string') {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios e devem ser do tipo correto.' })
        }
        if (!validarData(dataDeIncorporacao)) {
            return res.status(400).json({ message: 'Data de incorporação inválida. Use o formato YYYY-MM-DD e não informe datas futuras.' })
        }
        if (!cargosValidos.includes(cargo.toLowerCase())) {
            return res.status(400).json({ message: `Cargo inválido. Use um dos seguintes valores: ${cargosValidos.join(', ')}` })
        }
        const newAgente = { nome, dataDeIncorporacao, cargo }
        const agenteCriado = await agentesRepository.create(newAgente)
        res.status(201).json(agenteCriado)
    } catch (error) {
        return handleError(res, 500, error.message)
    }
}

async function updateAgente(req, res) {
    try {
        const { id } = req.params
        const { nome, dataDeIncorporacao, cargo, id: idBody } = req.body
        const cargosValidos = ['delegado', 'investigador', 'escrivao', 'policial']
        if (idBody && idBody !== id) {
            return res.status(400).json({ message: "O campo 'id' não pode ser alterado." })
        }
        if (!nome || typeof nome !== 'string' || !dataDeIncorporacao || !cargo || typeof cargo !== 'string') {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios e devem ser do tipo correto.' })
        }
        if (!validarData(dataDeIncorporacao)) {
            return res.status(400).json({ message: 'Data de incorporação inválida. Use o formato YYYY-MM-DD e não informe datas futuras.' })
        }
        if (!cargosValidos.includes(cargo.toLowerCase())) {
            return res.status(400).json({ message: `Cargo inválido. Use um dos seguintes valores: ${cargosValidos.join(', ')}` })
        }
        const agenteExistente = await agentesRepository.findById(id)
        if (!agenteExistente) {
            return res.status(404).json({ message: 'Agente não encontrado.' })
        }
        const agenteAtualizado = await agentesRepository.update(id, { nome, dataDeIncorporacao, cargo })
        res.status(200).json(agenteAtualizado)
    } catch (error) {
        return handleError(res, 500, error.message)
    }
}

async function patchAgente(req, res) {
    try {
        const { id } = req.params
        const updates = req.body
        const camposValidos = ['nome', 'dataDeIncorporacao', 'cargo']
        const cargosValidos = ['delegado', 'investigador', 'escrivao', 'policial']
        if ('id' in updates) {
            return res.status(400).json({ message: "O campo 'id' não pode ser alterado." }) 
        }
        const camposAtualizaveis = Object.keys(updates).filter(campo => camposValidos.includes(campo))
        if (updates.nome && typeof updates.nome !== 'string') {
            return res.status(400).json({ message: 'O campo nome deve ser uma string.' })
        }
        if (updates.cargo && typeof updates.cargo !== 'string') {
            return res.status(400).json({ message: 'O campo cargo deve ser uma string.' })
        }
        if (updates.cargo && !cargosValidos.includes(updates.cargo.toLowerCase())) {
            return res.status(400).json({ message: `Cargo inválido. Use um dos seguintes valores: ${cargosValidos.join(', ')}` })
        }
        if (updates.dataDeIncorporacao && !validarData(updates.dataDeIncorporacao)) {
            return res.status(400).json({ message: 'Data de incorporação inválida. Use o formato YYYY-MM-DD e não informe datas futuras.' })
        }
        if (camposAtualizaveis.length === 0) {
            return res.status(400).json({ message: 'Deve conter pelo menos um campo válido para atualização.' })
        }
        const agenteExistente = await agentesRepository.findById(id)
        if (!agenteExistente) {
            return res.status(404).json({ message: 'Agente não encontrado.' })
        }

        const filteredUpdates = {}
        camposAtualizaveis.forEach(campo => filteredUpdates[campo] = updates[campo])
        const patchedAgente = await agentesRepository.patchById(id, filteredUpdates)


        res.status(200).json(patchedAgente)
    } catch (error) {
        return handleError(res, 500, error.message)
    }
}

async function deleteAgente(req, res) {
    try {
        const { id } = req.params
        const agente = await agentesRepository.findById(id)
        if (!agente) {
            return res.status(404).json({ message: 'Agente não encontrado.' })
        }
        await agentesRepository.deleteById(id)
        res.status(204).send()
    } catch (error) {
        return handleError(res, 500, error.message)
    }
}

function validarData(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/
    if (!regex.test(dateString)) return false
    const date = new Date(dateString)
    const today = new Date()
    if (isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== dateString) return false
    if (date > today) return false
    return true
}

module.exports = {
    getAllAgentes,
    getAgenteById,
    createAgente,
    updateAgente,
    patchAgente,
    deleteAgente
}