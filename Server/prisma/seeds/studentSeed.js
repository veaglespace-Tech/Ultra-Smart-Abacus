export const studentSeed = async (prisma) => {
  for (let i = 1; i <= 55; i++) {
    const email = `student${i}@gmail.com`;
    const existing = await prisma.student.findUnique({
      where: { email }
    });

    if (!existing) {
      await prisma.student.create({
        data: {
          name: `Student ${i}`,
          email,
          password: `password${i}`,
          batchId: 1
        }
      });
    }
  }
};