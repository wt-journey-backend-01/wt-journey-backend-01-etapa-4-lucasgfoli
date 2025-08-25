/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('usuarios').del()
  await knex('usuarios').insert([
    {
      nome: 'Lucas Oliveira',
      email: 'emailexample@gmail.com',
      senha: 'nashed_password'
    },
    {
      nome: 'Alice Vieira',
      email: 'email2example@gmail.com',
      senha: 'nashed_password'
    },
    {
      nome: 'João Costa',
      email: 'emailexample33@gmail.com',
      senha: 'nashed_password'
    }
  ]);
};
