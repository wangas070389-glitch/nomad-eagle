const fs = require('fs');
let content = fs.readFileSync('src/server/actions/transactions.ts', 'utf8');

// Update function signature
content = content.replace(
  'export async function createTransaction(prevState: any, input: FormData | any) {',
  'export async function createTransaction(prevState: ActionState, input: FormData | CreateTransactionInput): Promise<ActionState> {'
);

// Import ActionState
if (!content.includes('import { ActionState }')) {
  content = content.replace(
    'import { getCategories } from "./categories"',
    'import { getCategories } from "./categories"\nimport { ActionState } from "@/lib/types"'
  );
}

fs.writeFileSync('src/server/actions/transactions.ts', content);
