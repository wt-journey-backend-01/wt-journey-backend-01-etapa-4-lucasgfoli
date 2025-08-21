/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Apaga dados existentes (para evitar duplicação ao rodar mais de uma vez)
  await knex('casos').del()
  await knex('agentes').del()

  // Insere agentes
  const agentes = await knex('agentes').insert([
    { id: 1, nome: 'João Silva', dataDeIncorporacao: '2020-05-10', cargo: 'Detetive' },
    { id: 2, nome: 'Maria Souza', dataDeIncorporacao: '2018-11-22', cargo: 'Investigadora' }
  ]).returning('id')

  // Insere casos (ligados aos agentes)
  await knex('casos').insert([
    { titulo: 'Roubo no centro', descricao: 'Roubo a uma joalheria no centro da cidade.', status: 'aberto', agente_id: 1 },
    { titulo: 'Fraude bancária', descricao: 'Esquema de fraude envolvendo cartões clonados.', status: 'solucionado', agente_id: 2 }
  ])
}
