import { FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '../database'

interface RequestWithUser extends FastifyRequest {
  user?: {
    id: string
  }
}

export async function checkSessionIdExists(
  request: RequestWithUser,
  reply: FastifyReply,
) {
  const sessionId = request.cookies.sessionId

  if (!sessionId) {
    return reply.status(401).send({ error: 'Unauthorized' })
  }

  const user = await knex('users').where({ session_id: sessionId }).first()

  if (!user) {
    return reply.status(401).send({ error: 'Unauthorized' })
  }

  request.user = user
}
