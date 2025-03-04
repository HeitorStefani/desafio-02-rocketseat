import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { app } from '../src/app'
import request from 'supertest'
import { execSync } from 'child_process'

describe('Meals routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new meal', async () => {
    const response = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        email: '2X9dD@example.com',
      })
      .expect(201)

    const cookies = response.get('Set-Cookie') || []

    const newMealResponse = await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Macarrao',
        description: 'Macarrao com molho de tomate',
        onDiet: true,
      })
    expect(newMealResponse.statusCode).toEqual(201)
  })
  it('should be able to list all meals', async () => {
    const userResponse = await request(app.server).post('/users').send({
      name: 'John Doe',
      email: '2X9dD@example.com',
    })

    const cookies = userResponse.get('Set-Cookie') || []

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Macarrao',
      description: 'Macarrao com molho de tomate',
      onDiet: true,
    })

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Arroz',
      description: 'Arroz com molho de tomate',
      onDiet: true,
    })

    const mealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    expect(mealsResponse.body.meals).toHaveLength(2)

    expect(mealsResponse.body.meals[0].name).toEqual('Macarrao')
    expect(mealsResponse.body.meals[1].name).toEqual('Arroz')
  })
  it('should be able to get a single meals', async () => {
    const userResponse = await request(app.server).post('/users').send({
      name: 'John Doe',
      email: '2X9dD@example.com',
    })

    const cookies = userResponse.get('Set-Cookie') || []

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Macarrao',
      description: 'Macarrao com molho de tomate',
      onDiet: true,
    })
    const meals = await request(app.server).get('/meals').set('Cookie', cookies)

    const mealId = meals.body.meals[0].id

    const singleMeal = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)

    expect(singleMeal.body.meal.name).toEqual('Macarrao')
  })
  it('should be able to update a meal', async () => {
    const userResponse = await request(app.server).post('/users').send({
      name: 'John Doe',
      email: '2X9dD@example.com',
    })

    const cookies = userResponse.get('Set-Cookie') || []

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Macarrao',
      description: 'Macarrao com molho de tomate',
      onDiet: true,
    })
    const meal = await request(app.server).get('/meals').set('Cookie', cookies)

    const mealId = meal.body.meals[0].id

    const updatedMeal = await request(app.server)
      .patch(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .send({
        name: 'Macarrao',
        description: 'Macarrao com molho de tomate',
        onDiet: false,
      })
    expect(updatedMeal.statusCode).toEqual(200)

    const updatedMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)

    expect(updatedMealResponse.body.meal.onDiet).toEqual(0)
  })
  it('should be able to delete a meal', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        email: '2X9dD@example.com',
      })
      .expect(201)

    const cookies = userResponse.get('Set-Cookie') || []

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Macarrao',
      description: 'Macarrao com molho de tomate',
      onDiet: true,
    })
    const meal = await request(app.server).get('/meals').set('Cookie', cookies)

    const mealId = meal.body.meals[0].id

    await request(app.server).delete(`/meals/${mealId}`).set('Cookie', cookies)

    const deletedMeal = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)

    expect(deletedMeal.statusCode).toEqual(404)
  })
  it('should be able to get the metrics of a user', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        email: '2X9dD@example.com',
      })
      .expect(201)

    const cookies = userResponse.get('Set-Cookie') || []

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Macarrao',
      description: 'Macarrao com molho de tomate',
      onDiet: true,
    })

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Arroz',
      description: 'Arroz com molho de tomate',
      onDiet: true,
    })

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Feijao',
      description: 'Feijao com molho de tomate',
      onDiet: false,
    })

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'mandioca',
      description: 'mandioca com queijo',
      onDiet: true,
    })

    const metrics = await request(app.server)
      .get('/meals/metrics')
      .set('Cookie', cookies)

    expect(metrics.body).toEqual({
      totalMeals: 4,
      mealsInDiet: 3,
      mealsOutOfDiet: 1,
      bestSequence: 2,
    })
  })
})
