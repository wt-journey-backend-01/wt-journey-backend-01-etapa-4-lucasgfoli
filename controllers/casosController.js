const casosRepository = require("../repositories/casosRepository");
const agentesRepository = require("../repositories/agentesRepository");
const handleError = require('../utils/errorHandler');

async function getAllCasos(req, res) {
    try {
        const { status, agente_id, search, orderBy, order } = req.query;
        let casos = await casosRepository.findAll();

        if (search) {
            const termo = search.toLowerCase();
            casos = casos.filter(caso =>
                caso.titulo.toLowerCase().includes(termo) ||
                caso.descricao.toLowerCase().includes(termo)
            );
        }

        if (status) {
            const statusValidos = ['aberto', 'solucionado'];
            if (!statusValidos.includes(status))
                return res.status(400).json({ message: "O status do caso deve ser 'aberto' ou 'solucionado'." });

            casos = casos.filter(caso => caso.status === status);
        }

        if (agente_id) {
            const agenteIdNum = Number(agente_id);
            if (isNaN(agenteIdNum)) return res.status(400).json({ message: "agente_id inválido" });

            const agenteExistente = await agentesRepository.findById(agenteIdNum);
            if (!agenteExistente) return res.status(404).json({ message: "Agente não encontrado com o agente_id fornecido." });

            casos = casos.filter(caso => caso.agente_id === agenteIdNum);
        }

        if (orderBy) {
            const camposValidos = ['titulo', 'status', 'agente_id'];
            if (!camposValidos.includes(orderBy))
                return res.status(400).json({ message: `Campo para ordenação inválido. Use: ${camposValidos.join(', ')}.` });

            const ordem = order === 'desc' ? -1 : 1;
            casos.sort((a, b) => {
                if (a[orderBy] < b[orderBy]) return -1 * ordem;
                if (a[orderBy] > b[orderBy]) return 1 * ordem;
                return 0;
            });
        }

        if (order && order !== 'asc' && order !== 'desc') {
            return res.status(400).json({ message: "Parâmetro 'order' inválido. Use 'asc' ou 'desc'." });
        }

        const casosComAgente = await Promise.all(
            casos.map(async caso => ({
                ...caso,
                agente: await agentesRepository.findById(caso.agente_id)
            }))
        );

        res.status(200).json(Array.isArray(casosComAgente) ? casosComAgente : []);
    } catch (error) {
        handleError(res, error);
    }
}

async function getSpecificCase(req, res) {
    try {
        const { id } = req.params;
        const idNum = Number(id);
        if (!id || isNaN(idNum)) return res.status(400).json({ message: "ID inválido." });

        const caso = await casosRepository.findById(idNum);
        if (!caso) return res.status(404).json({ message: "Caso não encontrado." });

        const agente = await agentesRepository.findById(caso.agente_id);
        res.status(200).json({ ...caso, agente });
    } catch (error) {
        handleError(res, error);
    }
}

async function createCase(req, res) {
    try {
        const { titulo, descricao, status, agente_id } = req.body;

        if (!titulo || !descricao || !status || !agente_id)
            return res.status(400).json({ message: "Todos os campos são obrigatórios." });

        if (typeof titulo !== 'string') return res.status(400).json({ message: "O título deve ser uma string." });
        if (typeof descricao !== 'string') return res.status(400).json({ message: "A descrição deve ser uma string." });
        if (!['aberto', 'solucionado'].includes(status))
            return res.status(400).json({ message: "O status do caso deve ser 'aberto' ou 'solucionado'." });

        const agenteIdNum = Number(agente_id);
        if (isNaN(agenteIdNum)) return res.status(400).json({ message: "agente_id inválido" });

        const agenteExistente = await agentesRepository.findById(agenteIdNum);
        if (!agenteExistente) return res.status(404).json({ message: "Agente não encontrado com o agente_id fornecido." });

        const newCase = { titulo, descricao, status, agente_id: agenteIdNum };
        const createdCase = await casosRepository.create(newCase);

        res.status(201).json(createdCase);
    } catch (error) {
        handleError(res, error);
    }
}

async function updateCase(req, res) {
    try {
        const { id } = req.params;
        const idNum = Number(id);
        if (!id || isNaN(idNum)) return res.status(400).json({ message: "ID inválido." });

        const { id: idBody, titulo, descricao, status, agente_id } = req.body;
        if (idBody && idBody !== idNum) return res.status(400).json({ message: "O campo 'id' não pode ser alterado." });

        if (!titulo || !descricao || !status || !agente_id)
            return res.status(400).json({ message: "Todos os campos são obrigatórios." });

        if (typeof titulo !== 'string') return res.status(400).json({ message: "O título deve ser uma string." });
        if (typeof descricao !== 'string') return res.status(400).json({ message: "A descrição deve ser uma string." });
        if (!['aberto', 'solucionado'].includes(status))
            return res.status(400).json({ message: "O status do caso deve ser 'aberto' ou 'solucionado'." });

        const agenteIdNum = Number(agente_id);
        if (isNaN(agenteIdNum)) return res.status(400).json({ message: "agente_id inválido" });

        const agenteExistente = await agentesRepository.findById(agenteIdNum);
        if (!agenteExistente) return res.status(404).json({ message: "Agente não encontrado com o agente_id fornecido." });

        const updatedCase = await casosRepository.update(idNum, { titulo, descricao, status, agente_id: agenteIdNum });
        if (!updatedCase) return res.status(404).json({ message: "Caso não encontrado." });

        res.status(200).json(updatedCase);
    } catch (error) {
        handleError(res, error);
    }
}

async function patchCase(req, res) {
    try {
        const { id } = req.params;
        const idNum = Number(id);
        if (!id || isNaN(idNum)) return res.status(400).json({ message: "ID inválido." });

        const updates = { ...req.body };

        if ('id' in updates) return res.status(400).json({ message: "O campo 'id' não pode ser alterado." });

        if (updates.agente_id) {
            const agenteIdNum = Number(updates.agente_id);
            if (isNaN(agenteIdNum)) return res.status(400).json({ message: "agente_id inválido" });

            const agenteExistente = await agentesRepository.findById(agenteIdNum);
            if (!agenteExistente) return res.status(404).json({ message: "Agente não encontrado com o agente_id fornecido." });

            updates.agente_id = agenteIdNum;
        }

        const updatedCase = await casosRepository.patchById(idNum, updates);
        if (!updatedCase) return res.status(404).json({ message: "Caso não encontrado." });

        res.status(200).json(updatedCase);
    } catch (error) {
        handleError(res, error);
    }
}

async function deleteCase(req, res) {
    try {
        const { id } = req.params;
        const idNum = Number(id);
        if (!id || isNaN(idNum)) return res.status(400).json({ message: "ID inválido." });

        const casoDeletado = await casosRepository.findById(idNum);
        if (!casoDeletado) return res.status(404).json({ message: "Caso não encontrado." });

        await casosRepository.deleteById(idNum);
        res.status(204).send();
    } catch (error) {
        handleError(res, error);
    }
}

module.exports = {
    getAllCasos,
    getSpecificCase,
    createCase,
    updateCase,
    patchCase,
    deleteCase
};
