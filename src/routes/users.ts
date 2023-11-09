import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'

export async function usersRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const users = await knex('users').select()

    return users
  })
  app.post('/', async (request, reply) => {
    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/meals',
        maxAge: 1000 * 60 * 6 * 24 * 7, // 7 dias
      })
    }

    const createUserBodySchema = z.object({
      username: z.string(),
      email: z.string(),
    })

    const { username, email } = createUserBodySchema.parse(request.body)

    await knex('users').insert({
      id: randomUUID(),
      username,
      email,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })
}
