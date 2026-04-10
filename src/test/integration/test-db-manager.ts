import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

export class TestDbManager {
  private static container: StartedPostgreSqlContainer
  private static prisma: PrismaClient

  static async start() {
    if (this.container) return { container: this.container, prisma: this.prisma }

    this.container = await new PostgreSqlContainer('postgres:16-alpine')
      .withDatabase('nomad_eagle_test')
      .withUsername('test_admin')
      .withPassword('test_pass')
      .start()

    const url = this.container.getConnectionUri()
    process.env.DATABASE_URL = url

    // Run migrations on the test database
    execSync('npx prisma db push --skip-generate', {
      env: { ...process.env, DATABASE_URL: url }
    })

    this.prisma = new PrismaClient({
      datasources: { db: { url } }
    })

    return { container: this.container, prisma: this.prisma }
  }

  static async stop() {
    if (this.prisma) await this.prisma.$disconnect()
    if (this.container) await this.container.stop()
  }

  static getPrisma() {
    return this.prisma
  }
}
