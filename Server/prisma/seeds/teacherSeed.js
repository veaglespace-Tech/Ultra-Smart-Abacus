import bcrypt from "bcrypt";

export async function teacherSeed(prisma) {
  const hashPassword = await bcrypt.hash("password123", 10);

  const teachersData = [
    {
      name: "Anjali Shinde",
      email: "anjalishinde@abacus.com",
      phone: "9823456789",
      experience: 4,
      specialization: "Senior Trainer"
    },
    {
      name: "Prakash Joshi",
      email: "prakashjoshi@abacus.com",
      phone: "9123456780",
      experience: 2,
      specialization: "Assistant Coach"
    },
    {
      name: "Sarah Jenkins",
      email: "sarahjenkins@abacus.com",
      phone: "8888999900",
      experience: 5,
      specialization: "Vedic Math Expert"
    }
  ];

  for (const teacher of teachersData) {
    const existing = await prisma.user.findUnique({
      where: { email: teacher.email }
    });

    if (!existing) {
      await prisma.teacher.create({
        data: {
          name: teacher.name,
          qualification: "Abacus Certified Instructor",
          experience: teacher.experience,
          phone: teacher.phone,
          specialization: teacher.specialization,
          user: {
            create: {
              name: teacher.name,
              email: teacher.email,
              password: hashPassword,
              role: "TEACHER"
            }
          }
        }
      });
      console.log(`Seeded teacher: ${teacher.name}`);
    }
  }
}
