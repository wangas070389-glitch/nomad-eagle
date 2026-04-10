import { PrismaClient } from "@prisma/client"
import { TaskRepository, CreateTaskCommand, TaskOutbox, TaskStatus, TaskType } from "../../domain/tasks/types"

export class PrismaTaskRepository implements TaskRepository {
  constructor(private prisma: PrismaClient) {}

  async save(command: CreateTaskCommand): Promise<string> {
    const task = await this.prisma.taskOutbox.create({
      data: {
        type: command.type,
        payload: command.payload,
        scheduledAt: command.scheduledAt || new Date()
      }
    })
    return task.id
  }

  async poll(limit: number): Promise<TaskOutbox[]> {
    const tasks = await this.prisma.taskOutbox.findMany({
      where: { status: 'PENDING' },
      orderBy: { scheduledAt: 'asc' },
      take: limit
    })

    return tasks.map(t => ({
      id: t.id,
      type: t.type as TaskType,
      payload: t.payload,
      status: t.status as TaskStatus,
      attempts: t.attempts,
      lastError: t.lastError || undefined,
      scheduledAt: t.scheduledAt,
      createdAt: t.createdAt
    }))
  }

  async updateStatus(id: string, status: TaskStatus, error?: string): Promise<void> {
    if (status === 'FAILED') {
      await this.prisma.taskOutbox.update({
        where: { id },
        data: {
          status,
          lastError: error,
          attempts: { increment: 1 }
        }
      })
    } else {
      await this.prisma.taskOutbox.update({
        where: { id },
        data: {
          status,
          processedAt: status === 'COMPLETED' ? new Date() : null,
          lastError: error || null
        }
      })
    }
  }
}
