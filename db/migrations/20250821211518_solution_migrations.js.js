/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('agentes', function(table) {
      table.increments('id').primary() 
      table.string('nome').notNullable()
      table.date('dataDeIncorporacao').notNullable()
      table.string('cargo').notNullable()
    })
    .then(() => {
      console.log('Tabela "agentes" criada com sucesso');
      return knex.schema.createTable('casos', function(table) {
        table.increments('id').primary() 
        table.string('titulo').notNullable()
        table.text('descricao').notNullable()
        table.enu('status', ['aberto', 'solucionado']).notNullable()
        table.integer('agente_id').unsigned().notNullable()
          .references('id').inTable('agentes').onDelete('CASCADE')
      })
    })
    .then(() => {
      console.log('Tabela "casos" criada com sucesso');
    })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('casos')
    .then(() => {
      console.log('Tabela "casos" removida com sucesso');
      return knex.schema.dropTableIfExists('agentes')
    })
    .then(() => {
      console.log('Tabela "agentes" removida com sucesso');
    })
};
