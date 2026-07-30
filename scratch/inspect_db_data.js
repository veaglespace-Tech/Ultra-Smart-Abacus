import prisma from "../Server/config/prisma.js";

async function inspect() {
  console.log("--- USERS ---");
  const users = await prisma.user.findMany();
  console.log(users);

  console.log("--- FRANCHISES ---");
  const franchises = await prisma.franchise.findMany({
    include: { user: true }
  });
  console.log(franchises);

  console.log("--- TEACHERS ---");
  const teachers = await prisma.teacher.findMany();
  console.log(teachers);

  console.log("--- STUDENTS ---");
  const students = await prisma.student.findMany();
  console.log(students);

  console.log("--- BATCHES ---");
  const batches = await prisma.batch.findMany();
  console.log(batches);
}

inspect().catch(console.error).finally(() => process.exit());
