/* eslint-disable camelcase */
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const [user] = await knex('users')
        .where('session_id', sessionId)
        .select('id')

      const userId = user.id

      const meals = await knex('meals').where('user_id', userId).select()

      return meals
    },
  )
  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const getMealsParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealsParamsSchema.parse(request.params)

      const { sessionId } = request.cookies

      const [user] = await knex('users')
        .where('session_id', sessionId)
        .select('id')

      const userId = user.id

      const meal = await knex('meals')
        .where({
          id,
          user_id: userId,
        })
        .first()

      if (!meal) {
        return reply.status(404).send({
          error: 'Refeição não encontrada',
        })
      }

      return {
        meal,
      }
    },
  )
  app.post('/', async (request, reply) => {
    const { sessionId } = request.cookies

    const [user] = await knex('users')
      .where('session_id', sessionId)
      .select('id')

    const userId = user.id

    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      on_diet: z.boolean(),
    })

    const { name, description, on_diet } = createMealBodySchema.parse(
      request.body,
    )

    await knex('meals').insert({
      id: randomUUID(),
      user_id: userId,
      name,
      description,
      on_diet,
    })

    return reply.status(201).send()
  })
  app.put(
    '/:id',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const getMealsParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealsParamsSchema.parse(request.params)

      const { sessionId } = request.cookies

      const [user] = await knex('users')
        .where('session_id', sessionId)
        .select('id')

      const userId = user.id

      const editMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        on_diet: z.boolean(),
      })

      const { name, description, on_diet } = editMealBodySchema.parse(
        request.body,
      )

      const meal = await knex('meals')
        .where({ id, user_id: userId })
        .first()
        .update({
          name,
          description,
          on_diet,
        })

      if (!meal) {
        return reply.status(401).send({
          error: 'Refeição não encontrada',
        })
      }

      return reply.status(202).send()
    },
  )
  app.delete(
    '/:id',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const getMealsParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealsParamsSchema.parse(request.params)

      const { sessionId } = request.cookies

      const [user] = await knex('users')
        .where('session_id', sessionId)
        .select('id')

      const userId = user.id

      const meal = await knex('meals')
        .where({ id, user_id: userId })
        .first()
        .delete()

      if (!meal) {
        return reply.status(401).send({
          error: 'Unauthorized',
        })
      }

      return reply.status(202).send('Refeição deletada com sucesso')
    },
  )
  app.get(
    '/summary',
    { preHandler: [checkSessionIdExists] },
    async (request) => {
      const { sessionId } = request.cookies

      const [user] = await knex('users')
        .where('session_id', sessionId)
        .select('id')

      const userId = user.id

      const [count] = await knex('meals')
        .count('id', {
          as: 'Total de refeições registradas',
        })
        .where('user_id', userId)

      const dieta = await knex('meals')
        .count('id', { as: 'Total de refeições dentro da dieta' })
        .where('on_diet', true)
        .andWhere('user_id', userId)

      const foraDieta = await knex('meals')
        .count('id', { as: 'Total de refeições fora da dieta' })
        .where('on_diet', false)
        .andWhere('user_id', userId)

      const summary = {
        'Total de refeições registradas': parseInt(
          JSON.parse(JSON.stringify(count))['Total de refeições registradas'],
        ),

        'Total de refeições dentro da dieta': parseInt(
          JSON.parse(JSON.stringify(dieta))[0][
            'Total de refeições dentro da dieta'
          ],
        ),

        'Total de refeições fora da dieta': parseInt(
          JSON.parse(JSON.stringify(foraDieta))[0][
            'Total de refeições fora da dieta'
          ],
        ),
      }

      return {
        summary,
      }
    },
  )
}
