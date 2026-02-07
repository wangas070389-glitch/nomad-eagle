# 2. Database Entity Relationship Diagram

Date: 2026-02-07

## Overview

Visual representation of the Prisma schema, highlighting the relationships between User, Household, Account, and Transaction entities.

## Diagram

```mermaid
erDiagram
    User ||--o{ Account : owns
    User ||--o{ Transaction : "spends/earns"
    User }|..|{ Household : "member of"
    
    Household ||--o{ User : "has members"
    Household ||--o{ Account : "tracks"
    Household ||--o{ Transaction : "aggregates"
    Household ||--o{ Category : "defines"

    Account ||--o{ Transaction : "contains"
    Category ||--o{ Transaction : "classifies"

    User {
        string id PK
        string email
        string name
        string householdId FK
    }

    Household {
        string id PK
        string name
        datetime createdAt
    }

    Account {
        string id PK
        string name
        string type "BANK | INVESTMENT | CASH"
        float balance
        string currency
        string ownerId FK
    }

    Transaction {
        string id PK
        float amount
        datetime date
        string description
        string type "INCOME | EXPENSE | TRANSFER"
        string accountId FK
        string categoryId FK
        string spentByUserId FK
    }

    Category {
        string id PK
        string name
        string type "INCOME | EXPENSE"
        string householdId FK
    }
```
