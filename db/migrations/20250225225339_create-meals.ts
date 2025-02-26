import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary()
    table.string('user_id').references('users.id').notNullable()
    table.string('name').notNullable()
    table.string('description').notNullable()
    table.timestamps(true, true)
    table.date('date').notNullable()
    table.boolean('onDiet')
  })
}

export async function down(knex: Knex): Promise<void> {
  return await knex.schema.dropTable('meals')
}
