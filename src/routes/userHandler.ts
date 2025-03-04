import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
// eslint-disable-next-line
import cookie from '@fastify/cookie'

export async function userHandler(app: FastifyInstance) {
  app.post('/', async (request, response) => {
    const userCreateSchema = z.object({
      name: z.string(),
      email: z.string().email(),
    })

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()
      response.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
      })
    }

    const { name, email } = userCreateSchema.parse(request.body)

    const isAlreadyExists = await knex('users').where({ email }).first()

    if (isAlreadyExists) {
      return response.status(400).send({ message: 'This user already exists!' })
    }

    await knex('users').insert({
      id: randomUUID(),
      name,
      email,
      session_id: sessionId,
    })

    return response.status(201).send({ message: 'User created!' }) // HTTP 201 é mais apropriado para criação
  })
}
