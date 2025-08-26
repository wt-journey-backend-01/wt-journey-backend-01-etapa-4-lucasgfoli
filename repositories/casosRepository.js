const knex = require("../db/db")

async function findAll() {
  return await knex("casos").select("*")
}

async function findById(id) {
  return await knex("casos").where({ id }).first()
}

async function create(caso) {
  const [newId] = await knex("casos").insert(caso).returning("id") // O knex sempre retorna um array de ids, mesmo que seja inserido só um.
  return findById(newId)
}

async function update(id, updateCaso) {
  const count = await knex("casos").where({ id }).update(updateCaso)
  if (count === 0) return undefined
  return findById(id)
}

async function patchById(id, updateCaso) {
  const count = await knex("casos").where({ id }).update(updateCaso)
  if (count === 0) return undefined
  return findById(id)
}

async function deleteById(id) {
  const caso = await findById(id)
  if (!caso) return undefined
  await knex("casos").where({ id }).del()
  return true
}

async function findFiltered({ status, agente_id, search, orderBy, order }) {
  const query = knex('casos')

  if (status) query.where('status', status)
  if (agente_id) query.where('agente_id', agente_id)
  if (search) {
    query.where(function() {
      this.where('titulo', 'ilike', `%${search}%`).orWhere('descricao', 'ilike', `%${search}%`)
    })
  }
  if (orderBy && ['titulo', 'status', 'agente_id'].includes(orderBy)) {
    query.orderBy(orderBy, order === 'desc' ? 'desc' : 'asc')
  }

  return await query.select('*')
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  patchById,
  deleteById,
  findFiltered
}