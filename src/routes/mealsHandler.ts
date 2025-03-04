import { randomUUID } from 'crypto'
import { FastifyInstance, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { checkSessionIdExists } from '../middlewares/checkSessionIdExists'
// eslint-disable-next-line
import cookies from '@fastify/cookie'
import { knex } from '../database'

interface requestWithUser extends FastifyRequest {
  user?: {
    id: string
  }
}

export async function mealsHandler(app: FastifyInstance) {
  app.post(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (request: requestWithUser, response) => {
      const mealsSchema = z.object({
        name: z.string(),
        description: z.string(),
        onDiet: z.boolean(),
      })

      const { name, description, onDiet } = mealsSchema.parse(request.body)

      await knex('meals')
        .insert({
          id: randomUUID(),
          user_id: request.user?.id,
          name,
          description,
          date: new Date().toLocaleString(),
          onDiet,
        })
        .then(() => {
          response.status(201).send()
        })
    },
  )

  app.patch(
    '/:id',
    { preHandler: [checkSessionIdExists] },
    async (request: requestWithUser, response) => {
      const { id } = request.params as { id: string }

      const mealsSchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        onDiet: z.boolean().optional(),
        date: z.string().optional(),
      })

      const updateData = mealsSchema.parse(request.body)

      if (Object.keys(updateData).length === 0) {
        return response.status(400).send({ message: 'No data provided' })
      }

      const meal = await knex('meals')
        .select('id', 'user_id')
        .where({ id })
        .first()

      if (!meal) {
        return response.status(404).send({ message: 'Meal not found' })
      }

      if (request.user?.id !== meal.user_id) {
        return response
          .status(403)
          .send({ message: 'you cant update this meal' })
      }

      await knex('meals')
        .where({ id })
        .update(updateData)
        .then(() => {
          response.status(200).send({ message: 'Meal updated successfully!' })
        })
    },
  )
  app.delete(
    '/:id',
    { preHandler: [checkSessionIdExists] },
    async (request: requestWithUser, response) => {
      const { id } = request.params as { id: string }

      const meal = await knex('meals')
        .select('id', 'user_id')
        .where({ id })
        .first()

      if (!meal) {
        return response.status(404).send({ message: 'Meal not found' })
      }

      if (meal.user_id !== request.user?.id) {
        return response
          .status(403)
          .send({ message: 'you cant delete this meal' })
      }

      await knex('meals')
        .where({ id })
        .del()
        .then(() => {
          response.status(200).send({ message: 'Meal deleted successfully!' })
        })
    },
  )
  app.get(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (request: requestWithUser, response) => {
      const meals = await knex('meals')
        .select('*')
        .where({ user_id: request.user?.id })

      return response.status(200).send({ meals })
    },
  )
  app.get(
    '/:id',
    { preHandler: [checkSessionIdExists] },
    async (request: requestWithUser, response) => {
      const { id } = request.params as { id: string }

      const meal = await knex('meals').select('*').where({ id }).first()

      if (!meal) {
        return response.status(404).send({ message: 'Meal not found' })
      }

      if (request.user?.id !== meal.user_id) {
        return response
          .status(403)
          .send({ message: 'you cant access this meal' })
      }
      return response.status(200).send({ meal })
    },
  )
  app.get(
    '/metrics',
    { preHandler: [checkSessionIdExists] },
    async (request: requestWithUser, response) => {
      const meals = await knex('meals')
        .select('*')
        .where({ user_id: request.user?.id })

      const metrics = {
        totalMeals: meals.length,
        mealsInDiet: meals.filter((meal) => meal.onDiet).length,
        mealsOutOfDiet: meals.filter((meal) => !meal.onDiet).length,
      }

      let bestSequence = 0
      let currentSequence = 0

      for (const meal of meals) {
        if (meal.onDiet) {
          currentSequence++
          if (currentSequence > bestSequence) {
            bestSequence = currentSequence
          }
        } else {
          currentSequence = 0
        }
      }
      return response.status(200).send({ ...metrics, bestSequence })
    },
  )
}
