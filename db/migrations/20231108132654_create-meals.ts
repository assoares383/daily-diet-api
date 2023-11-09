import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary()
    table.text('name').notNullable()
    table.text('description').notNullable()
    table.integer('created_at').defaultTo(knex.fn.now()).notNullable()
    table.boolean('on_diet').defaultTo(false).notNullable()
    table
      .integer('user_id')
      .unsigned()
      .index()
      .references('id')
      .inTable('users')
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('meals')
}
