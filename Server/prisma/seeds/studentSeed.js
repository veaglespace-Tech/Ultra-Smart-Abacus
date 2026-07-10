export const studentSeed = async (prisma) => {

const students = [];

for (let i = 1; i <= 55; i++) {
  students.push({
    name: `Student ${i}`,
    email: `student${i}@gmail.com`,
    password: `password${i}`,
    batchId: 1
  });
}

await prisma.student.createMany({
  data: students
});

};