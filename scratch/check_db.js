import prisma from "../Server/config/prisma.js";

async function main() {
  console.log("=== FRANCHISES ===");
  const franchises = await prisma.franchise.findMany({
    include: {
      user: true,
      students: true,
      teachers: true,
      batches: true,
      fees: true
    }
  });
  console.log("Franchises count:", franchises.length);
  console.log(JSON.stringify(franchises, null, 2));

  console.log("=== STUDENTS ===");
  const students = await prisma.student.findMany({
    include: { batch: true }
  });
  console.log("Students count:", students.length);
  console.log(JSON.stringify(students, null, 2));

  console.log("=== TEACHERS ===");
  const teachers = await prisma.teacher.findMany();
  console.log("Teachers count:", teachers.length);
  console.log(JSON.stringify(teachers, null, 2));

  console.log("=== BATCHES ===");
  const batches = await prisma.batch.findMany();
  console.log("Batches count:", batches.length);
  console.log(JSON.stringify(batches, null, 2));

  console.log("=== USERS ===");
  const users = await prisma.user.findMany({ where: { role: 'FRANCHISE' } });
  console.log("Users count:", users.length);
  console.log(JSON.stringify(users, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
