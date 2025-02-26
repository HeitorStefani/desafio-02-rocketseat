import { FastifyInstance } from 'fastify'
import { z } from 'zod'

export async function mealsHandler(app: FastifyInstance) {
  app.post('', async (request, response) => {
    const mealsSchema = z.object({
      name: z.string(),
    })
  })
}
