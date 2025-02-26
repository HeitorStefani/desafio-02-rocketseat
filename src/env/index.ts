import { z } from 'zod'
import { config } from 'dotenv'

// Carregando as variaveis de ambiente
if (process.env.NODE_ENV === 'test') {
  config({
    path: '.env.test',
  })
} else {
  config()
}

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string(),
  DATABASE_TYPE: z.enum(['sqlite', 'pg']).default('sqlite'),
  NODE_ENV: z.enum(['dev', 'prod', 'test']).default('dev'),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error(
    '❌ Algumas variáveis de ambiente estão faltando:',
    _env.error.format(),
  )
  throw new Error('Variáveis de ambiente ausentes')
}

export const env = _env.data
