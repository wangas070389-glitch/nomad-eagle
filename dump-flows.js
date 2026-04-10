const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  const flows = await prisma.recurringFlow.findMany();
  console.log(JSON.stringify(flows, null, 2));
  await prisma.$disconnect();
}
main();
