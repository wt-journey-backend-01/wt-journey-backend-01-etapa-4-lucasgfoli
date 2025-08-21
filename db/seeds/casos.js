/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Apaga dados existentes para evitar duplicação
  await knex('casos').del()

  // Insere casos (ligados aos agentes)
  await knex('casos').insert([
    { titulo: 'Roubo no centro', descricao: 'Roubo a uma joalheria no centro da cidade.', status: 'aberto', agente_id: 1 },
    { titulo: 'Fraude bancária', descricao: 'Esquema de fraude envolvendo cartões clonados.', status: 'solucionado', agente_id: 2 }
  ])
}
