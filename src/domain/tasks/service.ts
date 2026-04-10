import { TaskRepository, CreateTaskCommand, TaskStatus } from "./types"

/**
 * TaskDomainService
 * Domain service for managing asynchronous background tasks.
 * Pure logic, NO framework/infrastructure coupling.
 */
export class TaskDomainService {
  constructor(private repo: TaskRepository) {}

  async queue(command: CreateTaskCommand): Promise<string> {
    // 1. Invariant Checks (Wait for specific type constraints if needed)
    return await this.repo.save(command)
  }

  async poll(limit: number = 10) {
    return await this.repo.poll(limit)
  }

  async markProcessing(id: string) {
    await this.repo.updateStatus(id, 'PROCESSING')
  }

  async markCompleted(id: string) {
    await this.repo.updateStatus(id, 'COMPLETED')
  }

  async markFailed(id: string, error: string) {
    await this.repo.updateStatus(id, 'FAILED', error)
  }
}
