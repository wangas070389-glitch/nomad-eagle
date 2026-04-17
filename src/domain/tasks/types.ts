export type TaskType = 'GENERATE_EMBEDDING' | 'SEND_NOTIFICATION'

export type TaskStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export interface GenerateEmbeddingPayload extends Record<string, unknown> {
  transactionId: string
  description: string
}

export interface SendNotificationPayload extends Record<string, unknown> {
  userId: string
  message: string
}

export type TaskPayloadMap = {
  GENERATE_EMBEDDING: GenerateEmbeddingPayload
  SEND_NOTIFICATION: SendNotificationPayload
}

export type TaskOutbox = {
  [K in TaskType]: {
    id: string
    type: K
    payload: TaskPayloadMap[K]
    status: TaskStatus
    attempts: number
    lastError?: string
    scheduledAt: Date
    createdAt: Date
  }
}[TaskType]

export type CreateTaskCommand = {
  [K in TaskType]: {
    type: K
    payload: TaskPayloadMap[K]
    scheduledAt?: Date
  }
}[TaskType]

export interface TaskRepository {
  save(command: CreateTaskCommand): Promise<string>
  poll(limit: number): Promise<TaskOutbox[]>
  updateStatus(id: string, status: TaskStatus, error?: string): Promise<void>
}
