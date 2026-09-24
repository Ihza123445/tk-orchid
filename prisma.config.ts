import 'dotenv/config'
import path from 'node:path'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: path.join('prisma', 'migrations'),
  },
  datasource: {
    // SQLite file — dev/demo database
    url: `file:${path.join(__dirname, 'prisma', 'dev.db')}`,
  },
})
