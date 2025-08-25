const knex = require('../db/db')

async function findByEmail(email) {
  return await knex('usuarios').where({ email }).first()
}

async function findUserById(id) {
    return await knex('usuarios').where({ id }).first()
}

async function insertUser(usuario) {
    const [newId] = await knex('usuarios').insert(usuario).returning('id')
    return findUserById(newId)
}

async function update(id, usuario) {
    const count = await knex('usuarios').where({ id }).update(usuario)
    
    if( count === 0 ) return null
    return findById(id)
}

async function patchById(id, updateUsuario) {
    const count = await knex('usuarios').where({ id }).update(updateUsuario)
    
    if( count === 0 ) return null
    return findById(id)    
}

async function deleteById(id) {
    const usuario = await findById(id)

    if(!usuario) return null

    await knex('usuarios').where({ id }).del()
    return true
}

module.exports = {
    findUserById,
    findByEmail,
    insertUser,
    update,
    patchById,
    deleteById
}