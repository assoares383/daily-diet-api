import { FastifyInstance } from 'fastify'
import { knex } from '../database'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request) => {
    const { sessionId } = request.cookies

    const users = await knex('users').where('session_id', sessionId).select()

    console.log(users)
    return {
      users,
    }
  })
}
