/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  // Normalmente o up cria, mas aqui queremos apenas apagar as tabelas antigas
  return knex.schema
    .dropTableIfExists('casos')
    .then(() => {
      console.log('Tabela "casos" removida com sucesso');
      return knex.schema.dropTableIfExists('agentes')
    })
    .then(() => {
      console.log('Tabela "agentes" removida com sucesso');
    })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // O down poderia recriar as tabelas, mas como vamos criar migrations separadas,
  // podemos deixá-lo vazio ou apenas logar
  console.log('Rollback não faz nada porque as tabelas serão recriadas em migrations separadas');
  return Promise.resolve()
}
