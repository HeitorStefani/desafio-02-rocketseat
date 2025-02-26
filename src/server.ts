import { fastify } from 'fastify'
import { env } from './env'
import { mealsHandler } from './routes/mealsHandler'
import { userHandler } from './routes/userHandler'
import cookie from '@fastify/cookie'

const app = fastify()

app.register(cookie)
app.register(mealsHandler, { prefix: 'meals' })
app.register(userHandler, { prefix: 'users' })

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('Servidor ON!!')
  })
