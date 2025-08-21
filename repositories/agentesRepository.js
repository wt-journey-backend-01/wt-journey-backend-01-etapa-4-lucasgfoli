const knex = require('../db/db')

async function findAll() {
  return await knex('agentes').select('*')
}

async function findById(id) {
  return await knex('agentes').where({ id }).first()
}

async function create(agente) {
  const [result] = await knex('agentes').insert(agente).returning('id')
  const id = typeof result === 'object' ? result.id : result
  return findById(id)
}

async function update(id, updateAgente) {
  const count = await knex('agentes').where({ id }).update(updateAgente)
  if (count === 0) return undefined
  return findById(id)
}

async function patchById(id, updateAgente) {
  const count = await knex('agentes').where({ id }).update(updateAgente)
  if (count === 0) return undefined
  return findById(id)
}

async function deleteById(id) {
  const agente = await findById(id)
  if (!agente) return undefined
  await knex('agentes').where({ id }).del()
  return true
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  patchById,
  deleteById,
}