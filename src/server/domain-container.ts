import { prisma } from "@/lib/prisma"
import { PrismaLedgerRepository } from "../infrastructure/ledger/prisma-repository"
import { LedgerService } from "../domain/ledger/service"
import { PrismaTransactionRepository } from "../infrastructure/transactions/prisma-repository"
import { TransactionDomainService } from "../domain/transactions/service"
import { PrismaAccountRepository } from "../infrastructure/transactions/prisma-account-repository"
import { PrismaInvestmentRepository } from "../infrastructure/investments/prisma-repository"
import { InvestmentDomainService } from "../domain/investments/service"
import { PrismaTaskRepository } from "../infrastructure/tasks/prisma-repository"
import { TaskDomainService } from "../domain/tasks/service"
import { PermissionService } from "../domain/security/permission-service"
import { ProjectionDomainService } from "../domain/projections/service"

/**
 * DomainContainer
 * Simple singleton-based container for domain services.
 */
class DomainContainer {
  private static instance: DomainContainer
  
  public ledgerService: LedgerService
  public transactionService: TransactionDomainService
  public investmentService: InvestmentDomainService
  public taskService: TaskDomainService
  public permissionService: PermissionService
  public projectionService: ProjectionDomainService

  private constructor() {
    // 1. Ledger Infrastructure
    const ledgerRepo = new PrismaLedgerRepository(prisma)
    this.ledgerService = new LedgerService(ledgerRepo)

    // 2. Transactions Infrastructure
    const transRepo = new PrismaTransactionRepository(prisma)
    const accountRepo = new PrismaAccountRepository(prisma)
    
    // 4. Task Infrastructure
    const taskRepo = new PrismaTaskRepository(prisma)
    this.taskService = new TaskDomainService(taskRepo)

    // 5. Security Domain
    this.permissionService = new PermissionService()

    this.transactionService = new TransactionDomainService(transRepo, this.ledgerService, accountRepo, this.taskService, this.permissionService)

    // 3. Investments Infrastructure
    const investRepo = new PrismaInvestmentRepository(prisma)
    this.investmentService = new InvestmentDomainService(investRepo, this.transactionService, this.permissionService)

    // 6. Projections Domain
    this.projectionService = new ProjectionDomainService(ledgerRepo)
  }

  public static getInstance(): DomainContainer {
    if (!DomainContainer.instance) {
      DomainContainer.instance = new DomainContainer()
    }
    return DomainContainer.instance
  }
}

export const container = DomainContainer.getInstance()
