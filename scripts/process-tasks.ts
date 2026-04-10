import { prisma } from "../src/lib/prisma"
import { generateEmbedding } from "../src/lib/embedding"
import { container } from "../src/server/domain-container"

async function processTasks() {
  console.log("🛠️  Starting Task Processor...")
  
  const tasks = await container.taskService.poll(20)
  if (tasks.length === 0) {
    console.log("📭 No pending tasks.")
    return
  }

  console.log(`Processing ${tasks.length} tasks...`)

  for (const task of tasks) {
    console.log(`[${task.type}] Processing task ${task.id}...`)
    try {
      await container.taskService.markProcessing(task.id)

      if (task.type === 'GENERATE_EMBEDDING') {
        const { transactionId, description } = task.payload
        const embedding = await generateEmbedding(description)
        const vectorString = `[${embedding.join(",")}]`
        
        await prisma.$executeRaw`UPDATE "Transaction" SET "descriptionEmbedding" = ${vectorString}::vector WHERE id = ${transactionId}`
      }

      await container.taskService.markCompleted(task.id)
      console.log(`✅ Task ${task.id} completed.`)
    } catch (e: any) {
      console.error(`❌ Task ${task.id} failed:`, e.message)
      await container.taskService.markFailed(task.id, e.message)
    }
  }
}

// Simple loop if run directly, or one-off
const runContinuous = process.argv.includes('--continuous')

if (runContinuous) {
  setInterval(processTasks, 5000)
} else {
  processTasks()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
}
