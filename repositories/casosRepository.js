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

module.exports = {
  findAll,
  findById,
  create,
  update,
  patchById,
  deleteById,
}