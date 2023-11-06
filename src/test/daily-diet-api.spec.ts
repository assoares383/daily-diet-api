import { afterAll, beforeAll, beforeEach, it, describe } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../app'

describe('Users routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new user', async () => {
    await request(app.server)
      .post('/')
      .send({
        name: 'New user',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        diet_status: true,
      })
      .expect(201)
  })
})
