/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Apaga dados existentes para evitar duplicação
  await knex('agentes').del()

  // Insere agentes
  await knex('agentes').insert([
    { id: 1, nome: 'João Silva', dataDeIncorporacao: '2020-05-10', cargo: 'Detetive' },
    { id: 2, nome: 'Maria Souza', dataDeIncorporacao: '2018-11-22', cargo: 'Investigadora' }
  ])
}
