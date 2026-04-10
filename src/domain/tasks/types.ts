export type TaskType = 'GENERATE_EMBEDDING' | 'SEND_NOTIFICATION'

export type TaskStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export interface TaskOutbox {
  id: string
  type: TaskType
  payload: any
  status: TaskStatus
  attempts: number
  lastError?: string
  scheduledAt: Date
  createdAt: Date
}

export interface CreateTaskCommand {
  type: TaskType
  payload: any
  scheduledAt?: Date
}

export interface TaskRepository {
  save(command: CreateTaskCommand): Promise<string>
  poll(limit: number): Promise<TaskOutbox[]>
  updateStatus(id: string, status: TaskStatus, error?: string): Promise<void>
}
