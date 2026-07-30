import prisma from "../Server/config/prisma.js";

async function check() {
  const students = await prisma.$queryRawUnsafe(`SELECT id, name, batchId, franchiseId FROM Student`);
  console.log("=== STUDENTS ===");
  console.log(students);

  const batches = await prisma.$queryRawUnsafe(`SELECT id, name, code, level, franchiseId FROM Batch`);
  console.log("=== BATCHES ===");
  console.log(batches);
}

check().catch(console.error).finally(() => process.exit());
