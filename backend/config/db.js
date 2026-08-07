import 'dotenv'
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('Missing DATABASE_URL environment variable')
}

const adapter = new PrismaNeon({
  connectionString,
})

export const prisma = new PrismaClient({ adapter })