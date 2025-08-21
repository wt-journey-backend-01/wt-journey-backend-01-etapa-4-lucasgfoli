const knex = require('../db/db')

async function getAllUsuarios() {
    return await knex('usuarios').select('*')
}

async function findById(id) {
    return await knex('usuarios').where({ id }).first()
}

async function create(usuario) {
    const [newId] = await knex('usuarios').insert(caso).returning('id')
    return findById(newId)
}

async function update(id, updateUsuario) {
    const count = await knex('usuarios').where({ id }).update(updateUsuario)
    
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

    if(!caso) return null

    await knex('usuarios').where({ id }).del()
    return true
}

module.exports = {
    getAllUsuarios,
    findById,
    create,
    update,
    patchById,
    deleteById
}