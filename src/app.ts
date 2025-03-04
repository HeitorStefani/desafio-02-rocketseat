import { fastify } from 'fastify'
import { mealsHandler } from './routes/mealsHandler'
import { userHandler } from './routes/userHandler'
import cookie from '@fastify/cookie'

export const app = fastify()
app.addHook('onRequest', (request, reply, done) => {
  const methodColor = {
    GET: '\x1b[32m', // verde
    POST: '\x1b[34m', // azul
    PUT: '\x1b[33m', // amarelo
    DELETE: '\x1b[31m', // vermelho
  }

  const method = request.method.toUpperCase()
  const color = methodColor[method] || '\x1b[0m' // padrão

  console.log(`${color}${method}\x1b[0m ${request.url}`)
  done()
})

app.register(cookie)
app.register(mealsHandler, { prefix: 'meals' })
app.register(userHandler, { prefix: 'users' })
